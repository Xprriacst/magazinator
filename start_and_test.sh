#!/bin/bash

# Script pour démarrer Flask et tester le workflow n8n

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo "🚀 Starting Flask server..."

# Activer l'environnement virtuel et démarrer Flask en arrière-plan
source venv/bin/activate
python app.py &
FLASK_PID=$!

echo "Flask PID: $FLASK_PID"
echo "⏳ Waiting for Flask to start..."
sleep 5

# Tester l'API
echo "🧪 Testing Flask API..."
python simple_test.py

echo "📋 Instructions pour n8n:"
echo "1. Ouvrez n8n sur http://localhost:5678"
echo "2. Importez le workflow depuis: n8n-indesign-workflow.json"
echo "3. Activez le workflow"
echo "4. Testez avec cette URL: http://localhost:5678/webhook/indesign-automation"
echo ""
echo "📄 Exemple de requête curl:"
echo 'curl -X POST http://localhost:5678/webhook/indesign-automation \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{'
echo '    "prompt": "Magazine moderne avec design épuré",'
echo '    "text_content": "Article de test pour InDesign automation",'
echo '    "image_urls": ["https://picsum.photos/800/600?random=1"]'
echo '  }'"'"

echo ""
echo "🔧 Pour arrêter Flask: kill $FLASK_PID"
echo "💾 Flask logs visibles dans ce terminal"

# Garder le script actif pour voir les logs Flask
wait $FLASK_PID