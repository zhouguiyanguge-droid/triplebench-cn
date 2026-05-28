#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$(cd "$ROOT/.." && pwd)/.env"

get_env() {
  awk -F= -v key="$1" '$1==key {print substr($0, index($0, "=")+1)}' "$ENV_FILE"
}

GITHUB_USERNAME="$(get_env GITHUB_USERNAME)"
GITHUB_PAT="$(get_env GITHUB_PAT)"

if [[ -z "$GITHUB_USERNAME" || -z "$GITHUB_PAT" ]]; then
  echo "Missing GITHUB_USERNAME or GITHUB_PAT in $ENV_FILE" >&2
  exit 1
fi

AUTH="$(printf '%s:%s' "$GITHUB_USERNAME" "$GITHUB_PAT" | base64 | tr -d '\n')"

git -C "$ROOT" remote set-url origin "https://github.com/$GITHUB_USERNAME/triplebench-cn.git"
git -C "$ROOT" -c http.https://github.com/.extraheader="AUTHORIZATION: Basic $AUTH" push -u origin main
