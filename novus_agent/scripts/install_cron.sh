#!/usr/bin/env bash
# Install the daily `novus daily` cron job (Linux).
# Usage: ./scripts/install_cron.sh [HH:MM]   (default 08:00)
set -euo pipefail

TIME="${1:-08:00}"
HH="${TIME%%:*}"; MM="${TIME##*:}"
DIR="$(cd "$(dirname "$0")/.." && pwd)"
NOVUS="$(command -v novus || true)"
if [ -z "$NOVUS" ] && [ -x "$DIR/.venv/bin/novus" ]; then NOVUS="$DIR/.venv/bin/novus"; fi
if [ -z "$NOVUS" ]; then
  echo "novus CLI not found. Activate your venv and 'pip install -e .' first." >&2
  exit 1
fi

mkdir -p "$DIR/logs"
LINE="$MM $HH * * * cd $DIR && $NOVUS daily >> $DIR/logs/cron.log 2>&1"

( crontab -l 2>/dev/null | grep -v 'novus daily' ; echo "$LINE" ) | crontab -
echo "Installed: $LINE"
echo "Check with: crontab -l   |   Logs: $DIR/logs/cron.log"
