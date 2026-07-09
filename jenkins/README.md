# Running the real Jenkins pipeline locally

This is the actual setup used to prove the root `Jenkinsfile` works end to
end — not just that it parses, but that a real Jenkins controller can check
out this repo, build both apps, run both test suites, self-score the deploy
against a running Blastradius backend, gate on the score, and roll the new
images out to a real kind cluster.

## Prerequisites

- `docker-compose up -d` running in the repo root (Jenkins reaches the
  backend via the compose network, by service name `backend`)
- A kind cluster named `blastradius` with the k8s manifests already applied
  at least once (`kind create cluster --name blastradius`, `kubectl apply -f
  k8s/`) — Jenkins loads new image tags into it but doesn't create it

## Build and run

```bash
cd jenkins
docker build -t blastradius-jenkins:latest .

# kind's node containerd is only reachable from containers on the "kind"
# docker network, using the internal (in-cluster) API server address.
kind get kubeconfig --internal --name blastradius > /tmp/kubeconfig-internal.yaml

docker run -d --name blastradius-jenkins \
  -e JENKINS_ADMIN_PASSWORD=<choose-one> \
  -e KUBECONFIG=/var/jenkins_home/.kube/config \
  -e JAVA_OPTS="-Djenkins.install.runSetupWizard=false -Dhudson.plugins.git.GitSCM.ALLOW_LOCAL_CHECKOUT=true" \
  -p 8090:8080 \
  -v blastradius-jenkins-home:/var/jenkins_home \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v "$(cd .. && pwd)":/workspace/blastradius:ro \
  -v /tmp/kubeconfig-internal.yaml:/var/jenkins_home/.kube/config:ro \
  blastradius-jenkins:latest

docker network connect blastradius_default blastradius-jenkins
docker network connect kind blastradius-jenkins
```

Jenkins comes up fully configured (admin user, plugins, no setup wizard) via
`casc.yaml` — no browser wizard to click through.

Two things worth calling out because they were not obvious in advance and
only surfaced by actually running this:

- **`ALLOW_LOCAL_CHECKOUT=true`** — the Git plugin refuses `file://` remotes
  by default as a safety guard. Needed here because the "remote" is this
  repo mounted from the host, not an actual git server.
- **kind CLI version must match the cluster's kind version.** `kind load
  docker-image` talks to the node's containerd directly; a mismatch throws
  `failed to detect containerd snapshotter`. The Dockerfile pins a version —
  update it if you recreate the cluster with a different kind release.

## Create and run the job

The job is a standard "Pipeline script from SCM" pointed at
`file:///workspace/blastradius`, branch `main`, script path `Jenkinsfile` —
create it once via the UI (`http://localhost:8090`) or POST the job config.xml
via `/createItem`. Trigger builds from the UI or
`POST /job/blastradius-pipeline/build`.

When a build's score exceeds `RISK_THRESHOLD`, the pipeline pauses on an
`input` step. Approve it from the UI, or find the pending input's id at
`GET /job/blastradius-pipeline/<n>/api/json?depth=1` (look for
`InputAction.executions[].id`) and `POST
/job/blastradius-pipeline/<n>/input/<id>/proceedEmpty`.
