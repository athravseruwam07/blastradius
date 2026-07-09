# Running the real Jenkins pipeline locally

This is the actual setup used to prove the root `Jenkinsfile` works end to
end — not just that it parses, but that a real Jenkins controller can check
out this repo, build both apps, run both test suites, self-score the deploy
against a running Blastradius backend, gate on the score, and roll the new
images out to a real kind cluster.

Runs as the unprivileged `jenkins` user (not root), and the API key /
kind kubeconfig are provisioned as real Jenkins Credentials at boot — not
bind-mounted files or plaintext container env vars.

## Prerequisites

- `docker-compose up -d` running in the repo root (Jenkins reaches the
  backend via the compose network, by service name `backend`)
- A local image registry wired into the kind cluster:
  ```bash
  docker run -d --restart=always -p 5001:5000 --name kind-registry registry:2
  kind create cluster --name blastradius --config kind-config.yaml
  docker network connect kind kind-registry
  ```
  Port 5001, not 5000 — 5000 is taken by macOS's AirPlay Receiver. The
  Jenkinsfile pushes images to `localhost:5001/...`; the node's containerd
  pulls them back through the mirror config in `kind-config.yaml`, so
  `kubectl set image` never needs a separate `kind load` step — same shape
  a real registry (ECR/GHCR) would take against a real cluster.
- The k8s manifests already applied at least once (`kubectl apply -f k8s/`)
  — Jenkins pushes new image tags and rolls out deployments but doesn't
  create the cluster or apply the base manifests for the first time
- `cp .env.example .env` and fill in real values (must match the root
  `.env`'s `API_KEY`)

## Build and run

```bash
cd jenkins
docker build -t blastradius-jenkins:latest .
set -a; source .env; set +a

# kind's node containerd is only reachable from containers on the "kind"
# docker network, using the internal (in-cluster) API server address. This
# becomes a Jenkins Credential (secretFile), not a bind mount.
export KIND_KUBECONFIG_BASE64=$(kind get kubeconfig --internal --name blastradius | base64 | tr -d '\n')

docker run -d --name blastradius-jenkins \
  -e JENKINS_ADMIN_PASSWORD \
  -e BLASTRADIUS_API_KEY \
  -e KIND_KUBECONFIG_BASE64 \
  -e JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true" \
  -p 8090:8080 \
  -v blastradius-jenkins-home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(cd .. && pwd)":/workspace/blastradius:ro \
  blastradius-jenkins:latest

docker network connect blastradius_default blastradius-jenkins
docker network connect kind blastradius-jenkins
```

Jenkins comes up fully configured (admin user, plugins, credentials, no
setup wizard) via `casc.yaml` — no browser wizard to click through, and no
secret ever touches disk as a bind-mounted file.

Things worth calling out because they were not obvious in advance and only
surfaced by actually running this:

- **`ALLOW_LOCAL_CHECKOUT=true`** — the Git plugin refuses `file://` remotes
  by default as a safety guard. Needed here because the "remote" is this
  repo mounted from the host, not an actual git server.
- **kind CLI version must match the cluster's kind version** if you ever use
  `kind load docker-image` directly (e.g. for a one-off manual test) — it
  talks to the node's containerd directly, and a mismatch throws `failed to
  detect containerd snapshotter`. The Dockerfile pins a version — update it
  if you recreate the cluster with a different kind release. The Jenkinsfile
  itself doesn't use `kind load` anymore (see the registry above).
- **docker.sock's GID varies by host.** entrypoint.sh aligns a group on the
  `jenkins` user with the mounted socket's actual GID at container start,
  then drops from root to `jenkins` via `setpriv` before launching the real
  process — the controller itself never runs as root.

## Create and run the job

The job is a standard "Pipeline script from SCM" pointed at
`file:///workspace/blastradius`, branch `main`, script path `Jenkinsfile` —
create it once via the UI (`http://localhost:8090`) or POST the job config.xml
via `/createItem`. It polls the repo every 2 minutes and builds automatically
on new commits (see the `triggers` block in the Jenkinsfile) — a real GitHub
webhook is the equivalent for a repo that isn't a local `file://` clone.
You can also trigger manually from the UI or `POST /job/blastradius-pipeline/build`.

When a build's score exceeds `RISK_THRESHOLD`, the pipeline pauses on an
`input` step. Approve it from the UI, or find the pending input's id at
`GET /job/blastradius-pipeline/<n>/api/json?depth=1` (look for
`InputAction.executions[].id`) and `POST
/job/blastradius-pipeline/<n>/input/<id>/proceedEmpty`.
