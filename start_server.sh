#!/bin/bash
# Script intelligent pour Flask + mise à jour automatique n8n

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🚀 Démarrage du serveur Flask..."
python3 app.py &
FLASK_PID=$!

# Attendre que Flask soit prêt
sleep 3

echo "🔧 Mise à jour automatique du workflow n8n..."
python3 update_n8n_workflow.py

echo "✅ Système prêt! Flask PID: $FLASK_PID"
echo "📱 n8n: http://localhost:5678"
echo "🌐 Flask: http://$(python3 -c "import socket; s=socket.socket(socket.AF_INET, socket.SOCK_DGRAM); s.connect(('8.8.8.8', 80)); print(s.getsockname()[0]); s.close()"):5003"

# Attendre que Flask se termine
wait $FLASK_PID