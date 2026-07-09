# 💥 Blastradius

A deployment risk scoring platform. Blastradius sits in the CI/CD path, scores every
deploy **before** it ships, stores the outcome, and shows engineers a dashboard of
deploys and exactly *why* each one scored the way it did.

## The problem

Teams running many microservices have no systematic way to flag risky deploys before
they ship. A payment-service change on Friday at 5pm and a copy tweak to a marketing
page are treated identically by most pipelines. Blastradius makes that difference
explicit, deterministic, and explainable — no ML, just rules with clearly documented
weights.

## Architecture at a glance

```
┌────────────┐   POST /api/deploys/score   ┌──────────────────┐      ┌────────────┐
│  Jenkins    │ ──────────────────────────▶ │  Spring Boot API │ ───▶ │ PostgreSQL │
│  pipeline   │ ◀── score + breakdown ───── │  (scoring engine)│      └────────────┘
└────────────┘                              └──────────────────┘
                                                    ▲
                                                    │ REST (browser)
                                            ┌──────────────────┐
                                            │  Next.js frontend │
                                            │  (dashboard)      │
                                            └──────────────────┘
```

- **Backend** — Java 17+/Spring Boot (Web + Data JPA, constructor injection throughout).
  The scoring engine sums six independent, deterministic risk factors (criticality,
  diff size, test ratio, deploy timing, recent incidents, sensitive paths) into a
  0–100 score with a full per-factor breakdown. See `ARCHITECTURE.md`.
- **Database** — PostgreSQL storing `Service`, `Deploy` (with breakdown JSON), and
  `Incident` entities. Incidents can link back to the deploy that caused them,
  closing the feedback loop.
- **Frontend** — Next.js (TypeScript) + Tailwind: risk-sorted color-coded dashboard,
  deploy detail with the factor breakdown, a live "score a test deploy" form, and
  per-service history with a risk trend and linked incidents.
- **CI/CD** — a `Jenkinsfile` that builds, tests, **scores its own deployment** via
  `POST /api/deploys/score`, pauses for manual approval above a threshold, then
  deploys to the Kubernetes manifests in `k8s/`.

> **Note:** Blastradius deliberately scores its own deployments. The Jenkins pipeline
> submits the current build's real git diff metadata to the running instance, and the
> resulting deploy record (and its eventual shipped/rolled-back outcome) shows up on
> the dashboard like any other service.

## Run locally with docker-compose

Requires Docker. One command:

```bash
docker-compose up -d
```

This starts:

| Container  | Host port | What                    |
|------------|-----------|-------------------------|
| postgres   | 5433      | PostgreSQL 16           |
| backend    | 8080      | Spring Boot API         |
| frontend   | 3001      | Next.js dashboard       |

(Non-standard host ports 5433/3001 avoid clashing with locally running Postgres/dev
servers; in-cluster everything uses the standard 5432/8080/3000.)

Open http://localhost:3001 for the dashboard. The database is seeded on first boot
with demo services and a few deploys scored by the real engine.

Score a deploy from the command line:

```bash
curl -X POST http://localhost:8080/api/deploys/score \
  -H "Content-Type: application/json" \
  -d '{
    "serviceName": "payment-service",
    "diffLinesChanged": 1240,
    "prodLinesChanged": 1100,
    "testLinesChanged": 140,
    "changedPaths": ["/payment/gateway/ChargeProcessor.java"],
    "timestamp": "2026-07-10T17:30:00"
  }'
```

## REST API

| Method | Path                       | Purpose                                             |
|--------|----------------------------|-----------------------------------------------------|
| POST   | `/api/deploys/score`       | Score + persist a deploy; returns score & breakdown |
| GET    | `/api/deploys`             | List deploys (`?service=`, `?riskLevel=`, `?from=`, `?to=`) |
| GET    | `/api/deploys/{id}`        | Full deploy detail incl. factor breakdown           |
| POST   | `/api/deploys/{id}/outcome`| Record shipped/rolled-back (+ optional incident)    |
| GET    | `/api/services`            | Tracked services and criticality weights            |
| POST   | `/api/incidents`           | Log an incident against a service                   |

## Run the tests

Backend (JUnit; unit tests per scoring factor plus an HTTP integration test):

```bash
cd backend && mvn test
```

Frontend (Vitest + React Testing Library; dashboard and detail-view component tests):

```bash
cd frontend && npm test
```

## Deploy to Kubernetes (minikube or kind)

The manifests in `k8s/` define Deployments, Services, ConfigMaps, and a PVC for
Postgres.

```bash
# minikube — build images inside the cluster's Docker daemon
minikube start
eval $(minikube docker-env)
docker build -t blastradius-backend:latest backend/
docker build -t blastradius-frontend:latest frontend/
kubectl apply -f k8s/
kubectl get pods            # wait for Running
minikube service blastradius-frontend   # opens the dashboard

# kind — load locally built images into the cluster
kind create cluster --name blastradius
docker build -t blastradius-backend:latest backend/
docker build -t blastradius-frontend:latest frontend/
kind load docker-image blastradius-backend:latest blastradius-frontend:latest --name blastradius
kubectl apply -f k8s/
kubectl get pods
```

The backend is exposed on NodePort 30080 and the frontend on NodePort 30300. Because
the browser calls the API directly, build the frontend image with
`--build-arg NEXT_PUBLIC_API_BASE=http://<node-ip>:30080` when the cluster is not on
localhost.

No cluster handy? Validate the manifests without one:

```bash
kubectl apply --dry-run=client --validate=false -f k8s/
```

## Repository layout

```
backend/    Spring Boot API + scoring engine + tests
frontend/   Next.js dashboard + component tests
k8s/        Kubernetes manifests (Deployments, Services, ConfigMaps, PVC)
Jenkinsfile CI/CD pipeline (build → test → self-score → gate → deploy)
ARCHITECTURE.md  Design decisions, layering, extensibility, limitations
```
