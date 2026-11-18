#!/usr/bin/env bash
set -e

NGROK_BIN="$(command -v ngrok || true)"
if [ -z "$NGROK_BIN" ] && [ -x "$HOME/.local/bin/ngrok" ]; then
  NGROK_BIN="$HOME/.local/bin/ngrok"
fi

if [ -z "$NGROK_BIN" ]; then
  echo "Ngrok is not installed."
  echo "Install it, then run: ngrok config add-authtoken YOUR_TOKEN"
  exit 1
fi

node scripts/report-receiver.js &
RECEIVER_PID=$!

cleanup() {
  kill "$RECEIVER_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Receiver started on http://localhost:8787"
echo "Starting Ngrok tunnel... copy the HTTPS forwarding URL into GitHub secret REPORT_RECEIVER_URL"
"$NGROK_BIN" http 8787
