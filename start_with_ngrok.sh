#!/bin/bash

# Script pour démarrer Flask + ngrok pour le cloud n8n

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🚀 Starting Flask + ngrok for cloud n8n..."

# Vérifier si ngrok est installé
if ! command -v ngrok &> /dev/null; then
    echo "❌ ngrok not found. Installing..."
    echo "Please install ngrok:"
    echo "  brew install ngrok"
    echo "  or download from: https://ngrok.com/download"
    exit 1
fi

# Tuer les processus existants sur le port 5002
echo "🔄 Cleaning up existing processes..."
lsof -ti:5002 | xargs -r kill 2>/dev/null || true

# Démarrer Flask en arrière-plan
echo "🌶️ Starting Flask server..."
source venv/bin/activate
python app.py &
FLASK_PID=$!

echo "Flask PID: $FLASK_PID"
echo "⏳ Waiting for Flask to start..."
sleep 3

# Vérifier que Flask fonctionne
if curl -s http://localhost:5002/ > /dev/null; then
    echo "✅ Flask is running on http://localhost:5002"
else
    echo "❌ Flask failed to start"
    kill $FLASK_PID 2>/dev/null || true
    exit 1
fi

# Démarrer ngrok en arrière-plan
echo "🌐 Starting ngrok tunnel..."
ngrok http 5002 --log=stdout > ngrok.log &
NGROK_PID=$!

echo "ngrok PID: $NGROK_PID"
echo "⏳ Waiting for ngrok tunnel..."
sleep 5

# Récupérer l'URL publique ngrok
NGROK_URL=$(curl -s http://localhost:4040/api/tunnels | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "📋 Check ngrok logs:"
    cat ngrok.log
    kill $FLASK_PID $NGROK_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Your Flask API is now publicly accessible:"
echo "📍 Public URL: $NGROK_URL"
echo "🔗 API Endpoint: $NGROK_URL/api/create-layout-urls"
echo ""
echo "📋 IMPORTANT: Update your n8n workflow:"
echo "1. In n8n, edit the 'Call Flask API' node"
echo "2. Change the URL from:"
echo "   http://localhost:5002/api/create-layout-urls"
echo "   TO:"
echo "   $NGROK_URL/api/create-layout-urls"
echo ""
echo "🧪 Test with this curl command:"
echo "curl -X POST https://polaris-ia.app.n8n.cloud/webhook-test/indesign-automation \\"
echo "  -H \"Content-Type: application/json\" \\"
echo "  -d '{"
echo "    \"prompt\": \"Magazine moderne minimaliste\","
echo "    \"text_content\": \"Test depuis n8n cloud vers Flask local via ngrok\","
echo "    \"image_urls\": [\"https://picsum.photos/800/600?random=1\"]"
echo "  }'"
echo ""
echo "📊 Monitor:"
echo "- Flask logs: visible in this terminal"
echo "- ngrok dashboard: http://localhost:4040"
echo "- ngrok logs: tail -f ngrok.log"
echo ""
echo "🛑 To stop: kill $FLASK_PID $NGROK_PID"

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FLASK_PID $NGROK_PID 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

# Capturer Ctrl+C pour nettoyer proprement
trap cleanup SIGINT SIGTERM

# Garder le script actif et afficher les logs Flask
echo "🔄 Monitoring Flask logs (Ctrl+C to stop)..."
echo "=================================================="
wait $FLASK_PID