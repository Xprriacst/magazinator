#!/bin/bash

# 🧪 Test curl pour le workflow n8n corrigé
# Pipeline: Texte + Image → OpenAI → Fusion → Flask → InDesign

echo "🚀 Test du workflow n8n avec curl + multipart/form-data"
echo "=================================================="

# Configuration
WEBHOOK_URL="http://localhost:5678/webhook/indesign-webhook"
IMAGE_PATH="/Users/alexandreerrasti/Downloads/Image ChatGPT 18 août 2025.png"
CONTENU="Les nouvelles tendances en design graphique révolutionnent l'industrie créative. Les designers explorent des techniques innovantes qui mélangent tradition et modernité. Cette évolution transforme notre façon de concevoir les supports visuels pour l'ère numérique."

echo "📡 Webhook URL: $WEBHOOK_URL"
echo "📝 Contenu: ${CONTENU:0:100}..."
echo "📷 Image: $IMAGE_PATH"
echo

# Vérification de l'image
if [ ! -f "$IMAGE_PATH" ]; then
    echo "❌ ERREUR: Image non trouvée à $IMAGE_PATH"
    exit 1
fi

IMAGE_SIZE=$(ls -lh "$IMAGE_PATH" | awk '{print $5}')
echo "✅ Image trouvée (taille: $IMAGE_SIZE)"
echo

# Test avec curl multipart/form-data
echo "🔄 Envoi de la requête curl..."
echo "================================"

curl -X POST "$WEBHOOK_URL" \
  -H "Content-Type: multipart/form-data" \
  -F "contenu=$CONTENU" \
  -F "subtitle=Une révolution créative en cours" \
  -F "images=@$IMAGE_PATH" \
  --verbose \
  --max-time 180 \
  --show-error \
  --fail-with-body

CURL_EXIT_CODE=$?

echo
echo "================================"
echo "🏁 Résultat du test"

if [ $CURL_EXIT_CODE -eq 0 ]; then
    echo "✅ SUCCÈS - Requête curl exécutée sans erreur"
    echo "🎯 Le workflow a reçu le texte ET l'image"
    echo "🤖 OpenAI devrait avoir analysé le texte"
    echo "🔗 Le nœud Fusion devrait avoir préservé l'image"
    echo "🚀 Flask devrait avoir reçu contenu IA + image"
else
    echo "❌ ÉCHEC - Code de sortie curl: $CURL_EXIT_CODE"
    echo "🔍 Vérifiez que n8n fonctionne sur localhost:5678"
    echo "🔍 Vérifiez que le webhook 'indesign-webhook' existe"
fi

echo
echo "📋 Pour débugger dans n8n:"
echo "1. Ouvrez l'exécution dans n8n"
echo "2. Vérifiez les logs du nœud '🔗 Fusion données'"
echo "3. Confirmez que les données binaires sont préservées"