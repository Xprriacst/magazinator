#!/usr/bin/env python3
"""
Test simple et rapide du workflow n8n.

Usage:
    python test_n8n_simple.py
"""

import requests
import json

# URL du webhook n8n (à modifier selon votre configuration)
WEBHOOK_URL = "https://06171c8ada56.ngrok-free.app/webhook/indesign-automation"

def test_simple():
    """Test simple du workflow."""
    payload = {
        "prompt": "Test rapide n8n",
        "text_content": "Contenu de test simple",
        "image_urls": ["https://picsum.photos/800/600?random=1"]
    }
    
    print("🚀 Test du webhook n8n...")
    print(f"URL: {WEBHOOK_URL}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=payload,
            headers={'Content-Type': 'application/json'},
            timeout=120
        )
        
        print(f"\n📊 Résultat:")
        print(f"Status Code: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            result = response.json()
            print(f"Réponse: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            if result.get('status') == 'success':
                print("✅ Test réussi!")
                if 'download_url' in result:
                    print(f"🔗 Téléchargement: {result['download_url']}")
            else:
                print("❌ Test échoué")
        else:
            print(f"Réponse (text): {response.text}")
            
    except Exception as e:
        print(f"❌ Erreur: {e}")

if __name__ == "__main__":
    test_simple()