#!/bin/bash

# Démarrage complet en mode local : Flask + N8N

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🏠 DÉMARRAGE MODE LOCAL COMPLET"
echo "=============================="
echo "🌶️  Flask API: http://localhost:5002"  
echo "🔄 N8N Interface: http://localhost:5678"
echo "📡 Webhook: http://localhost:5678/webhook/indesign-automation"
echo ""

# Nettoyer les processus existants
echo "🔄 Nettoyage des processus..."
lsof -ti:5002 | xargs -r kill 2>/dev/null || true
lsof -ti:5678 | xargs -r kill 2>/dev/null || true

# Démarrer Flask
echo "🌶️  Démarrage Flask..."
source venv/bin/activate
python app.py &
FLASK_PID=$!

echo "Flask PID: $FLASK_PID"
sleep 3

# Vérifier Flask
if curl -s http://localhost:5002/ > /dev/null; then
    echo "✅ Flask OK sur http://localhost:5002"
else
    echo "❌ Erreur Flask"
    kill $FLASK_PID 2>/dev/null || true
    exit 1
fi

# Vérifier si n8n est installé
if ! command -v n8n &> /dev/null; then
    echo "⚠️  N8N non installé. Installation..."
    npm install -g n8n
fi

# Démarrer N8N
echo "🔄 Démarrage N8N..."
n8n start &
N8N_PID=$!

echo "N8N PID: $N8N_PID"
echo "⏳ Attente de N8N (30s)..."
sleep 30

# Vérifier N8N
if curl -s http://localhost:5678/ > /dev/null; then
    echo "✅ N8N OK sur http://localhost:5678"
else
    echo "❌ Erreur N8N"
    kill $FLASK_PID $N8N_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 SYSTÈME LOCAL COMPLET DÉMARRÉ!"
echo "================================"
echo ""
echo "📱 INTERFACES:"
echo "   • N8N Interface: http://localhost:5678"
echo "   • Flask API: http://localhost:5002"
echo ""
echo "🧪 IMPORT WORKFLOW:"
echo "   1. Aller sur http://localhost:5678"
echo "   2. Créer un compte ou se connecter"
echo "   3. Import -> Coller le contenu de 'n8n-local-workflow.json'"
echo "   4. Activer le workflow"
echo ""
echo "🔗 WEBHOOK URL:"
echo "   http://localhost:5678/webhook/indesign-automation"
echo ""
echo "📊 TEST RAPIDE:"
echo "curl -X POST http://localhost:5678/webhook/indesign-automation \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\": \"Test local\", \"text_content\": \"Ça marche!\"}'"
echo ""
echo "🛑 Pour arrêter: kill $FLASK_PID $N8N_PID"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt du système local..."
    kill $FLASK_PID $N8N_PID 2>/dev/null || true
    echo "✅ Arrêté"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Garder les processus actifs
echo ""
echo "🔄 Système en cours... (Ctrl+C pour arrêter)"
echo "============================================="
wait