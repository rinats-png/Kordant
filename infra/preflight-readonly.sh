#!/usr/bin/env bash
set -euo pipefail
printf '%s\n' 'KORDANT read-only server inventory (no changes)'
id
uname -a
date -u +'%Y-%m-%dT%H:%M:%SZ'
command -v docker >/dev/null && docker version --format '{{.Server.Version}}' || true
command -v docker >/dev/null && docker ps --format '{{.Names}} {{.Image}} {{.Status}}' || true
command -v caddy >/dev/null && caddy version || true
command -v ss >/dev/null && ss -lnt || true
command -v df >/dev/null && df -h || true
printf '%s\n' 'Do not paste credentials or unrestricted docker inspect output into AI chats.'
