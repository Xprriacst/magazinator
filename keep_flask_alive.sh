#!/bin/bash
# Script pour maintenir Flask en vie automatiquement

PROJECT_DIR="/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🔄 Maintien de Flask en vie..."

while true; do
    # Vérifier si Flask tourne sur le port 5002
    if ! lsof -i :5002 > /dev/null 2>&1; then
        echo "❌ Flask arrêté, redémarrage..."
        cd "$PROJECT_DIR"
        source venv/bin/activate
        nohup python app.py > flask.log 2>&1 &
        echo "✅ Flask redémarré (PID: $!)"
        sleep 5
    else
        echo "✅ Flask actif $(date)"
    fi
    
    # Vérifier toutes les 30 secondes
    sleep 30
done