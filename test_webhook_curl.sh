#!/bin/bash
# Test du webhook n8n avec curl

WEBHOOK_URL="http://localhost:5678/webhook/indesign-webhook"

echo "🚀 Test du webhook n8n avec curl..."
echo "📍 URL: $WEBHOOK_URL"

# Données de test JSON
TEST_DATA='{
  "contenu": "Guide complet de la photographie numérique. Techniques avancées pour débuter. La photographie est un art qui demande de la pratique et de la patience. Apprenez les bases de exposition, de la composition et du post-traitement.",
  "image_urls": [
    "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
  ]
}'

echo "📋 Données envoyées:"
echo "$TEST_DATA" | python3 -m json.tool

echo ""
echo "🔄 Envoi de la requête POST..."

# Test avec curl
RESPONSE=$(curl -s -w "\nHTTP_CODE:%{http_code}" \
  -X POST \
  -H "Content-Type: application/json" \
  -d "$TEST_DATA" \
  "$WEBHOOK_URL")

# Séparer la réponse du code HTTP
HTTP_CODE=$(echo "$RESPONSE" | grep "HTTP_CODE:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | grep -v "HTTP_CODE:")

echo "✅ Code HTTP: $HTTP_CODE"
echo "📥 Réponse:"
echo "$BODY" | python3 -m json.tool 2>/dev/null || echo "$BODY"

if [ "$HTTP_CODE" -eq 200 ]; then
    echo ""
    echo "🎉 Webhook fonctionne ! Le workflow a été déclenché."
else
    echo ""
    echo "❌ Problème détecté:"
    echo "  - Code HTTP: $HTTP_CODE"
    echo "  - Vérifiez que le workflow est activé dans n8n"
    echo "  - Vérifiez que le webhook accepte les requêtes POST"
fi