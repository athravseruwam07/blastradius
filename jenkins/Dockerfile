# Custom Jenkins controller with the CLIs the Blastradius Jenkinsfile shells
# out to: docker (to build the app images), kubectl and kind (to deploy to
# the local kind cluster). Mounts the host's docker.sock rather than running
# Docker-in-Docker, so images built here land directly in the host daemon.
#
# Runs as root (not the default `jenkins` user) purely to avoid GID-matching
# the mounted docker.sock across hosts — fine for this local CI proof, not
# something you'd do for a production Jenkins controller.
FROM jenkins/jenkins:lts-jdk17

USER root

RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    jq \
    maven \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Debian's docker.io package ships dockerd but not the docker CLI binary on
# this base image, so pull the official static client instead.
RUN ARCH=$(dpkg --print-architecture) && \
    DOCKER_ARCH=$([ "$ARCH" = "arm64" ] && echo "aarch64" || echo "x86_64") && \
    curl -Lo /tmp/docker.tgz "https://download.docker.com/linux/static/stable/${DOCKER_ARCH}/docker-27.3.1.tgz" && \
    tar -xzf /tmp/docker.tgz -C /tmp && \
    mv /tmp/docker/docker /usr/local/bin/docker && \
    rm -rf /tmp/docker.tgz /tmp/docker

RUN ARCH=$(dpkg --print-architecture) && \
    curl -Lo /usr/local/bin/kubectl "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/${ARCH}/kubectl" && \
    chmod +x /usr/local/bin/kubectl

RUN ARCH=$(dpkg --print-architecture) && \
    curl -Lo /usr/local/bin/kind "https://kind.sigs.k8s.io/dl/v0.24.0/kind-linux-${ARCH}" && \
    chmod +x /usr/local/bin/kind

COPY plugins.txt /usr/share/jenkins/ref/plugins.txt
RUN jenkins-plugin-cli --plugin-file /usr/share/jenkins/ref/plugins.txt

COPY casc.yaml /var/jenkins_home/casc.yaml

ENV JAVA_OPTS="-Djenkins.install.runSetupWizard=false"
ENV CASC_JENKINS_CONFIG="/var/jenkins_home/casc.yaml"
