#!/bin/bash
"""
Script pour exécuter les tests du workflow n8n.
"""

echo "🔧 Tests du workflow n8n InDesign"
echo "================================="

# Vérifier si Python est disponible
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 n'est pas installé"
    exit 1
fi

# Vérifier si les dépendances sont installées
echo "📦 Vérification des dépendances..."
python3 -c "import requests" 2>/dev/null || {
    echo "❌ Module 'requests' manquant. Installation..."
    pip3 install requests
}

echo ""
echo "🚀 Choix du test:"
echo "1. Test simple et rapide"
echo "2. Test complet de bout en bout"
echo "3. Les deux"
echo ""

read -p "Votre choix (1-3): " choice

case $choice in
    1)
        echo "▶️  Test simple..."
        python3 test_n8n_simple.py
        ;;
    2)
        echo "▶️  Test de bout en bout..."
        python3 test_n8n_end_to_end.py
        ;;
    3)
        echo "▶️  Test simple..."
        python3 test_n8n_simple.py
        echo ""
        echo "▶️  Test de bout en bout..."
        python3 test_n8n_end_to_end.py
        ;;
    *)
        echo "❌ Choix invalide"
        exit 1
        ;;
esac

echo ""
echo "✅ Tests terminés"