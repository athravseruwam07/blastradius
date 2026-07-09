#!/bin/bash
# Runs as root only long enough to align a group GID with the host's mounted
# docker.sock (its GID varies by host, so it can't be baked into the image),
# then drops to the unprivileged jenkins user for the actual process — this
# container no longer runs Jenkins as root.
set -e

if [ -S /var/run/docker.sock ]; then
  SOCK_GID=$(stat -c '%g' /var/run/docker.sock)
  if getent group "$SOCK_GID" >/dev/null 2>&1; then
    GROUP_NAME=$(getent group "$SOCK_GID" | cut -d: -f1)
  else
    GROUP_NAME=dockerhost
    groupadd -g "$SOCK_GID" "$GROUP_NAME"
  fi
  usermod -aG "$GROUP_NAME" jenkins
fi

# setpriv changes uid/gid but not env vars — HOME stays whatever root's was
# (/root) unless set explicitly, which breaks anything that writes to $HOME
# (npm's cache dir, in particular: "EACCES ... /root/.npm").
export HOME=/var/jenkins_home
exec setpriv --reuid=jenkins --regid=jenkins --init-groups /usr/local/bin/jenkins.sh "$@"
