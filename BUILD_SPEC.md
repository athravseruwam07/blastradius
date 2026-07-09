# Blastradius — Build Spec

A deployment risk scoring platform. This document is the single source of truth for what "done" means. Every checkbox in the "Definition of Done" section at the bottom must be checked off, with proof, before this project is considered complete.

## Problem

Teams running many microservices don't have a systematic way to flag which deploys are risky before they ship (e.g. a payment-service change on Friday at 5pm vs. a copy tweak to a marketing page). This tool sits in the CI/CD path, scores every deploy, stores the outcome, and shows engineers a dashboard of upcoming/past deploys and why they were scored the way they were.

## Required tech stack (do not substitute)

- Backend: Java 17+, Spring Boot (Spring Web, Spring Data JPA, constructor injection throughout — no field injection anywhere)
- Database: PostgreSQL
- Frontend: Next.js (TypeScript), Tailwind CSS
- Containerization: Docker (separate Dockerfiles for backend and frontend, plus docker-compose.yml for local dev with Postgres)
- Orchestration: Kubernetes manifests (Deployments, Services, ConfigMaps, PVC for Postgres) runnable on minikube or kind
- CI/CD: A Jenkinsfile that builds, tests, and deploys the backend and frontend to the K8s manifests on push

## Core functionality

### 1. Risk scoring engine (backend)

Rule-based, deterministic, fully explainable (not ML). Score 0-100 plus a breakdown of contributing factors:

- Per-service criticality weight
- Diff size (lines changed)
- Ratio of test code changed vs. production code changed
- Time of day / day of week (Friday evening and weekends score higher)
- Recent incident count for that service in the last 30 days
- Whether the deploy touches predefined "sensitive paths" (e.g. `/auth/`, `/payment/`, `/billing/`)

Each factor must have a clearly commented weight in code. The API must return which factors triggered and their point contributions, not just the final number.

### 2. Data model (Postgres via Spring Data JPA)

- `Service` — name, criticality weight, sensitive path patterns
- `Deploy` — service, timestamp, diff size, test/prod line ratio, computed risk score, score breakdown (JSON), status (pending/shipped/rolled_back)
- `Incident` — linked to a service, timestamp, severity, optional linked deploy (feedback loop)

### 3. REST API (Spring Boot)

- `POST /api/deploys/score` — accepts deploy metadata, computes and persists a risk score, returns score + breakdown
- `GET /api/deploys` — list recent deploys with scores, filterable by service/date/risk level
- `GET /api/deploys/{id}` — full detail including score breakdown
- `POST /api/deploys/{id}/outcome` — record rollback or incident outcome (feedback loop)
- `GET /api/services` — list tracked services and criticality weights
- `POST /api/incidents` — log an incident against a service

### 4. Frontend (Next.js)

- Dashboard listing recent/upcoming deploys sorted by risk score, color-coded by risk level
- Deploy detail view showing the full score breakdown
- A form to manually submit a test deploy and see it scored live
- Per-service history view showing risk trend over time and linked incidents/rollbacks

### 5. Jenkins integration

Jenkinsfile stages: build, unit test, call the app's own `POST /api/deploys/score` endpoint with this build's own metadata, pause for manual approval if the score is above a configured threshold, otherwise auto-deploy to the K8s manifests. Document in the README that the tool deliberately scores its own deployments.

### 6. Tests

- Backend unit tests covering each scoring factor independently and combined, plus an integration test hitting `POST /api/deploys/score`
- Frontend component tests for the dashboard and detail view

## Documentation required

- `README.md` — problem, architecture, how the pieces fit together, exact commands to run docker-compose and deploy to minikube
- `ARCHITECTURE.md` — why constructor injection is used and where, how Spring Boot layers are organized (controller/service/repository), how the scoring engine is structured so new factors can be added without modifying existing code, what happens end-to-end when Jenkins triggers a deploy, known limitations and what you'd improve with more time
- Inline comments in the scoring engine explaining the reasoning behind each weight

## Constraints

- Do not remove or weaken any test to make it pass.
- Do not hardcode sample API responses — they must come from the actual scoring engine logic running against real input.
- Do not skip the Kubernetes manifests even if local cluster testing falls back to dry-run validation.

## Definition of Done

Check off every item below. For each, the proof must be actually run and pasted into the conversation — not just claimed.

- [ ] `docker-compose up -d` succeeds with no manual intervention beyond that command; `docker-compose ps` shows backend, frontend, and postgres containers running/healthy
- [ ] Backend test suite passes: test command output shows all tests passed, exit code 0
- [ ] Frontend test suite passes: test command output shows all tests passed, exit code 0
- [ ] Live end-to-end check: with the stack running, `curl` a realistic sample payload to `POST /api/deploys/score` and the response shows a non-null risk score and non-empty factor breakdown
- [ ] `kubectl apply -f` against all K8s manifests on a local cluster completes without error and `kubectl get pods` shows all pods Running — OR, if no local cluster is available, `kubectl apply --dry-run=client -f` against every manifest passes validation with no errors
- [ ] `README.md` and `ARCHITECTURE.md` both exist, are non-empty, and `ARCHITECTURE.md` specifically addresses dependency injection choices and how the scoring engine supports adding new factors without modifying existing code
- [ ] All 6 REST API endpoints listed above exist and are reachable
- [ ] All 3 data model entities exist as JPA entities with the fields listed above
- [ ] Frontend has all 4 views listed above (dashboard, detail view, manual submit form, per-service history)
- [ ] Jenkinsfile exists with the stages described above

This project is not complete until every box above is checked with demonstrated proof, not assumption.
