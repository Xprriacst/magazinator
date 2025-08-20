#!/usr/bin/env python3
"""
Script pour tester le webhook n8n facilement
"""
import requests
import json

def test_webhook():
    """Teste le webhook n8n avec des données d'exemple"""
    
    # URL du webhook (vous devrez la mettre à jour après import)
    webhook_url = "http://localhost:5678/webhook/indesign-webhook"
    
    # Données de test
    test_data = {
        "contenu": "Guide complet de la photographie numérique. Techniques avancées pour débuter. La photographie est un art qui demande de la pratique et de la patience. Apprenez les bases de l'exposition, de la composition et du post-traitement.",
        "image_urls": [
            "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a",
            "https://images.unsplash.com/photo-1516035069371-29a1b244cc32"
        ]
    }
    
    print("🚀 Test du webhook n8n...")
    print(f"📍 URL: {webhook_url}")
    print(f"📋 Données: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(
            webhook_url, 
            json=test_data,
            timeout=30
        )
        
        print(f"✅ Status: {response.status_code}")
        print(f"📥 Réponse: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('status') == 'success':
                print("🎉 SUCCESS!")
                print(f"📄 Project ID: {result.get('project_id')}")
                print(f"📥 Download: {result.get('download_url')}")
            else:
                print("❌ ERREUR dans le workflow")
                print(result.get('message', 'Pas de message d\'erreur'))
        else:
            print(f"❌ HTTP Error: {response.status_code}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        print("🔍 Vérifiez que:")
        print("  - n8n Docker fonctionne (http://localhost:5678)")
        print("  - Le workflow webhook est activé")
        print("  - L'URL du webhook est correcte")

if __name__ == "__main__":
    test_webhook()