#!/bin/bash

# Script pour démarrer Flask + ngrok (avec authentification)

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🚀 Starting Flask + authenticated ngrok..."

# Nettoyer les processus existants
echo "🔄 Cleaning up..."
lsof -ti:5002 | xargs kill -9 2>/dev/null || true
pkill -f ngrok 2>/dev/null || true

# Démarrer Flask
echo "🌶️ Starting Flask..."
source venv/bin/activate
python app.py &
FLASK_PID=$!
echo "Flask PID: $FLASK_PID"

# Attendre que Flask démarre
sleep 3

# Vérifier Flask
if ! curl -s http://localhost:5002/ > /dev/null; then
    echo "❌ Flask failed to start"
    kill $FLASK_PID 2>/dev/null
    exit 1
fi
echo "✅ Flask running on http://localhost:5002"

# Démarrer ngrok
echo "🌐 Starting ngrok tunnel..."
ngrok http 5002 --log=stdout > ngrok.log 2>&1 &
NGROK_PID=$!
echo "ngrok PID: $NGROK_PID"

# Attendre ngrok
echo "⏳ Waiting for ngrok..."
sleep 5

# Récupérer l'URL publique
NGROK_URL=""
for i in {1..10}; do
    NGROK_URL=$(curl -s http://localhost:4040/api/tunnels 2>/dev/null | grep -o '"public_url":"https://[^"]*' | grep -o 'https://[^"]*' | head -1)
    if [ ! -z "$NGROK_URL" ]; then
        break
    fi
    echo "⏳ Attempt $i/10..."
    sleep 2
done

if [ -z "$NGROK_URL" ]; then
    echo "❌ Failed to get ngrok URL"
    echo "📋 ngrok logs:"
    tail -20 ngrok.log
    echo ""
    echo "🔑 Make sure you're authenticated:"
    echo "   1. Sign up: https://dashboard.ngrok.com/signup"
    echo "   2. Get token: https://dashboard.ngrok.com/get-started/your-authtoken"
    echo "   3. Run: ngrok config add-authtoken YOUR_TOKEN"
    kill $FLASK_PID $NGROK_PID 2>/dev/null || true
    exit 1
fi

echo ""
echo "🎉 SUCCESS! Flask is now publicly accessible:"
echo "📍 ngrok URL: $NGROK_URL"
echo "🔗 API Endpoint: $NGROK_URL/api/create-layout-urls"
echo ""
echo "📋 NEXT STEPS:"
echo "1. Copy this URL: $NGROK_URL/api/create-layout-urls"
echo "2. In n8n, edit 'Call Flask API' node"
echo "3. Replace the URL with the one above"
echo "4. Save and test your workflow"
echo ""
echo "🧪 Quick test command:"
echo "curl -X POST https://polaris-ia.app.n8n.cloud/webhook-test/indesign-automation \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -d '{"
echo "    \"prompt\": \"Magazine test via ngrok\","
echo "    \"text_content\": \"Test complet du workflow\","
echo "    \"image_urls\": [\"https://picsum.photos/800/600?random=1\"]"
echo "  }'"
echo ""
echo "📊 Monitor:"
echo "- ngrok dashboard: http://localhost:4040"
echo "- Flask logs: visible below"
echo "- ngrok logs: tail -f ngrok.log"
echo ""

# Fonction de nettoyage
cleanup() {
    echo ""
    echo "🛑 Stopping services..."
    kill $FLASK_PID $NGROK_PID 2>/dev/null || true
    echo "✅ Cleanup complete"
    exit 0
}

trap cleanup SIGINT SIGTERM

echo "🔄 Monitoring Flask logs (Ctrl+C to stop):"
echo "=================================================="
wait $FLASK_PID