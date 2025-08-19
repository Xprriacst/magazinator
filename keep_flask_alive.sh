#!/bin/bash
# Script pour maintenir Flask (port 5003) en vie automatiquement

set -e

PROJECT_DIR="/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"
PORT=5003
LOG_FILE="$PROJECT_DIR/flask.log"

echo "🔄 Maintien de Flask en vie (port $PORT)..."

while true; do
  if ! lsof -i :$PORT > /dev/null 2>&1; then
    echo "❌ Flask arrêté, redémarrage..."
    cd "$PROJECT_DIR"
    # Activer venv si présent
    if [ -f "venv/bin/activate" ]; then
      # shellcheck disable=SC1091
      source venv/bin/activate
    fi
    # Démarrage en arrière-plan
    nohup python app.py > "$LOG_FILE" 2>&1 &
    echo "✅ Flask redémarré (PID: $!)"
    sleep 5
  else
    echo "✅ Flask actif $(date)"
  fi
  sleep 30
done