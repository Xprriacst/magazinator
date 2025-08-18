#!/bin/bash

# 🚀 QUICK START - Automation InDesign
# Script de démarrage rapide pour relancer tout en 1 clic

echo "🎯 AUTOMATION INDESIGN - QUICK START"
echo "======================================"

# Aller dans le bon répertoire
cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

echo ""
echo "📁 Répertoire de travail : $(pwd)"

# Vérifier que les fichiers essentiels existent
echo ""
echo "🔍 Vérification des fichiers..."

if [ ! -f "app.py" ]; then
    echo "❌ ERREUR : app.py manquant"
    exit 1
fi

if [ ! -f "scripts/template_simple_working.jsx" ]; then
    echo "❌ ERREUR : script InDesign manquant"
    exit 1
fi

if [ ! -f "indesign_templates/template-test-1708.indt" ]; then
    echo "❌ ERREUR : template InDesign manquant"
    exit 1
fi

echo "✅ Tous les fichiers essentiels présents"

# Afficher l'état d'InDesign
echo ""
echo "🎨 Vérification InDesign..."
if pgrep -f "Adobe InDesign" > /dev/null; then
    echo "✅ InDesign est ouvert"
else
    echo "⚠️  InDesign n'est pas ouvert - IMPORTANT : Ouvrez InDesign avant de continuer"
fi

# Afficher l'état de Docker
echo ""
echo "🐳 Vérification Docker..."
if docker ps > /dev/null 2>&1; then
    echo "✅ Docker est disponible"
    
    # Vérifier si n8n tourne déjà
    if docker ps --format "table {{.Names}}" | grep -q "n8n"; then
        echo "✅ n8n container déjà en cours"
    else
        echo "⚠️  n8n container pas encore démarré"
    fi
else
    echo "❌ ERREUR : Docker n'est pas disponible"
    exit 1
fi

echo ""
echo "🚀 COMMANDES DE DÉMARRAGE :"
echo "=========================="
echo ""
echo "1️⃣  DÉMARRER N8N LOCAL :"
echo "   docker run -it --rm --name n8n -p 5678:5678 -v ~/.n8n:/home/node/.n8n n8nio/n8n"
echo ""
echo "2️⃣  DÉMARRER FLASK API (dans un autre terminal) :"
echo "   cd \"$(pwd)\""
echo "   python3 app.py"
echo ""
echo "3️⃣  IMPORTER LE WORKFLOW N8N :"
echo "   - Aller sur http://localhost:5678"
echo "   - Importer le fichier : n8n-local-workflow.json"
echo "   - Activer le workflow"
echo ""
echo "4️⃣  TESTER LE WORKFLOW :"
echo "   curl -X POST http://localhost:5678/webhook/indesign-automation \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"prompt\": \"TEST WORKFLOW\", \"text_content\": \"Contenu test\", \"image_urls\": [\"https://picsum.photos/600/400\"]}'"
echo ""
echo "🎯 RÉSULTAT ATTENDU :"
echo "   - Fichier .indd créé dans le dossier 'output/'"
echo "   - Taille ~970 KB"
echo ""
echo "🐛 PROBLÈME CONNU :"
echo "   - Images se téléchargent mais ne s'affichent pas dans le .indd"
echo "   - À débugger demain"
echo ""
echo "✅ STATUT PROJET : 95% FONCTIONNEL"