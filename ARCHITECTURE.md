# Blastradius — Architecture

## Dependency injection: constructor injection, everywhere

Every Spring bean in this codebase receives its collaborators through its constructor —
there is no field injection (`@Autowired` on fields) anywhere.

Where it shows up:

- `DeployService(DeployRepository, ServiceRepository, IncidentRepository, RiskScoringEngine, ObjectMapper)`
- `IncidentService(IncidentRepository, ServiceRepository, DeployRepository)`
- `DeployController(DeployService)`, `ServiceController(ServiceRepository)`, `IncidentController(IncidentService)`
- `RiskScoringEngine(List<RiskFactor>)` — Spring injects *every* `RiskFactor` bean
- `RecentIncidentsFactor(IncidentRepository)` — the one factor that needs data access
- `DataSeeder(...)` — the demo-data bootstrap

Why constructor injection and not field injection:

1. **Dependencies are explicit and the object is always valid.** A constructed
   `DeployService` can never exist half-wired; field injection permits a window where
   the bean exists with null dependencies.
2. **Final fields.** All injected fields are `final`, so wiring is immutable and
   thread-safety reasoning is simpler.
3. **Plain-Java testability.** Unit tests build `RecentIncidentsFactor(mockRepository)`
   directly — no Spring context, no reflection utilities — which is exactly how the
   factor unit tests work.
4. **Design feedback.** A constructor with too many parameters is visible pain that
   flags a class doing too much; field injection hides that smell.

## Spring Boot layering

Classic three-layer layout, one responsibility per layer:

```
com.blastradius
├── web/          controllers + DTOs + exception handler   (HTTP concerns only)
├── service/      DeployService, IncidentService           (transactions, orchestration)
├── repository/   Spring Data JPA interfaces               (persistence queries)
├── domain/       JPA entities: MonitoredService, Deploy, Incident
├── scoring/      the risk engine (framework-agnostic core + factor beans)
└── config/       CORS, demo-data seeding
```

- **Controllers** translate HTTP ⇄ DTOs and delegate; they contain no business logic.
- **Services** own transactions (`@Transactional`) and orchestrate the engine,
  repositories, and JSON serialization of breakdowns.
- **Repositories** are interface-only Spring Data JPA declarations.
- **DTOs (records) keep the API contract decoupled from JPA entities**, so schema
  evolution doesn't silently change the wire format.

The scoring package depends only on the domain and repository layers — not on the web
layer — so it can be exercised headlessly (tests, seeding, future batch rescoring).

## Scoring engine: open for extension, closed for modification

The engine is deliberately structured so **adding a factor requires zero changes to
existing code**:

- `RiskFactor` is a tiny interface: `name()`, `maxPoints()`, `evaluate(ScoringContext)`.
- Each factor is an independent `@Component` (`CriticalityFactor`, `DiffSizeFactor`,
  `TestRatioFactor`, `DeployTimingFactor`, `RecentIncidentsFactor`,
  `SensitivePathFactor`).
- `RiskScoringEngine` receives `List<RiskFactor>` by constructor injection. Spring
  populates that list with every `RiskFactor` bean in the context, sorted by name for
  deterministic breakdown ordering.

To add a "rollback history" factor tomorrow: write one new class implementing
`RiskFactor`, annotate it `@Component`, give it a commented weight, and write its unit
test. The engine, the API, the persistence format (a JSON list of factor results), and
the frontend breakdown view all pick it up automatically. Nothing existing is edited —
the open/closed principle applied concretely.

Supporting choices:

- `ScoringContext` is an immutable record snapshot of everything a factor may inspect,
  so factors are pure functions of their input (the incident factor adds one read-only
  repository query). Determinism is a hard requirement: same input ⇒ same score.
- Factor max-points are budgeted to sum to exactly 100 (25+20+15+15+15+10), asserted
  by a unit test, with a defensive clamp in the engine.
- Every factor result carries a human-readable `detail` string; the API returns which
  factors triggered and their exact point contributions, never just the total.
- Weights are constants with explanatory comments in each factor class — the "why"
  lives next to the number.

## End-to-end: what happens when Jenkins triggers a deploy

1. **Build** — Maven packages the backend; npm builds the frontend.
2. **Unit test** — `mvn test` and `npm test`; failures stop the pipeline.
3. **Score this deploy** — the pipeline derives real metadata for the current build
   from git (`git diff --shortstat/--numstat/--name-only`): total lines, test vs prod
   lines, changed paths. It POSTs that to a running Blastradius instance's
   `/api/deploys/score`. The backend loads the `Service` row, runs all six factors,
   persists a `Deploy` with the breakdown JSON, and returns score + breakdown, which
   the pipeline echoes into the build log. Blastradius deliberately dogfoods itself
   this way.
4. **Risk gate** — if the score exceeds `RISK_THRESHOLD` (default 60), Jenkins pauses
   on an `input` step; a human reviews the breakdown in the dashboard and approves or
   aborts. At or below threshold, the gate is skipped entirely.
5. **Deploy** — images are rebuilt with the build-number tag, `kubectl apply -f k8s/`
   reconciles the manifests, and the deployments are rolled with
   `kubectl rollout status` verification.
6. **Feedback loop** — on pipeline success the deploy's outcome is recorded as
   `SHIPPED` via `POST /api/deploys/{id}/outcome`; on failure `ROLLED_BACK`. Incidents
   logged later can link to the deploy, which raises the service's
   `recent_incidents` factor for the *next* 30 days of deploys — past pain
   automatically makes future deploys score higher.

## Known limitations / what I'd improve with more time

- **Security**: no authentication on the API and permissive CORS; DB credentials sit
  in a ConfigMap. Next step: API tokens for CI, a K8s `Secret`, locked-down CORS.
- **Filtering in memory**: `GET /api/deploys` filters a full table scan in the service
  layer. Fine at demo scale; at real scale this becomes a JPA `Specification`/indexed
  query with pagination.
- **Schema management**: `ddl-auto: update` is convenient but not production-grade —
  Flyway migrations would make schema changes reviewable and reversible.
- **Timezone handling**: deploy timestamps are naive `LocalDateTime`s; a
  multi-region org needs zone-aware timing (Friday 17:00 *where?*).
- **Weight calibration**: weights are hand-tuned constants. With outcome data
  accumulating (shipped vs rolled back), a periodic job could report each factor's
  predictive value and suggest recalibration — while keeping the rule-based,
  explainable core.
- **Frontend data fetching** is client-side only; server components with streaming
  would improve first paint, and a WebSocket could live-update the dashboard as CI
  scores deploys.
- **Jenkins pipeline** assumes a docker+kubectl-capable agent and derives test-line
  counts from path patterns (`*test*`); language-aware diff classification would be
  more accurate.
