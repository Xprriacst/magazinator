#!/bin/bash

# Démarrage en mode local uniquement (sans ngrok)

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🚀 Démarrage en mode LOCAL UNIQUEMENT"
echo "====================================="

# Nettoyer les processus existants
echo "🔄 Nettoyage des processus..."
lsof -ti:5002 | xargs -r kill 2>/dev/null || true

# Démarrer Flask
echo "🌶️ Démarrage de Flask..."
source venv/bin/activate
python app.py &
FLASK_PID=$!

echo "Flask PID: $FLASK_PID"
echo "⏳ Attente du démarrage..."
sleep 3

# Vérifier que Flask fonctionne
if curl -s http://localhost:5002/ > /dev/null; then
    echo "✅ Flask fonctionne sur http://localhost:5002"
else
    echo "❌ Erreur de démarrage Flask"
    kill $FLASK_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 SYSTÈME PRÊT EN LOCAL!"
echo "========================"
echo "🔗 API URL: http://localhost:5002/api/create-layout-urls"
echo "🔑 Token: alexandreesttropbeau"
echo ""
echo "🧪 Test rapide:"
echo "curl -X POST http://localhost:5002/api/create-layout-urls \\"
echo "  -H 'Authorization: Bearer alexandreesttropbeau' \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{\"prompt\": \"Test local\", \"text_content\": \"Contenu test\", \"image_urls\": [\"https://picsum.photos/800/600\"]}'"
echo ""
echo "📊 Scripts de test disponibles:"
echo "- python3 test_final_indesign.py"
echo "- python3 test_api_simple.py"
echo ""
echo "🛑 Pour arrêter: kill $FLASK_PID"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Arrêt du système..."
    kill $FLASK_PID 2>/dev/null || true
    echo "✅ Terminé"
    exit 0
}

# Capturer Ctrl+C
trap cleanup SIGINT SIGTERM

# Afficher les logs Flask en temps réel
echo "🔄 Logs Flask (Ctrl+C pour arrêter):"
echo "===================================="
wait $FLASK_PID