#!/usr/bin/env python3
"""
Test simple de l'API sans dépendance InDesign.
"""

import requests
import json

def test_api_with_auth():
    """Test de l'API avec authentification."""
    
    url = "http://localhost:5002/api/create-layout-urls"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer alexandreesttropbeau"
    }
    
    payload = {
        "prompt": "Magazine test",
        "text_content": "Contenu de test pour vérifier l'API",
        "image_urls": ["https://picsum.photos/800/600?random=1"]
    }
    
    print("🚀 Test de l'API Flask avec authentification...")
    print(f"URL: {url}")
    print(f"Payload: {json.dumps(payload, indent=2)}")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=30)
        
        print(f"\n📊 Résultat:")
        print(f"Status Code: {response.status_code}")
        
        if response.headers.get('content-type', '').startswith('application/json'):
            result = response.json()
            print(f"Réponse JSON: {json.dumps(result, indent=2, ensure_ascii=False)}")
            
            if result.get('success') == False and 'InDesign' in str(result.get('error', '')):
                print("✅ API fonctionne correctement (erreur InDesign attendue)")
                return True
            elif result.get('success') == True:
                print("✅ API et InDesign fonctionnent parfaitement!")
                return True
            else:
                print("❌ Erreur inattendue")
                return False
        else:
            print(f"Réponse (text): {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def test_api_without_auth():
    """Test sans authentification (devrait échouer)."""
    
    url = "http://localhost:5002/api/create-layout-urls"
    headers = {"Content-Type": "application/json"}
    
    payload = {
        "prompt": "Test sans auth",
        "text_content": "Test",
        "image_urls": ["https://picsum.photos/800/600?random=1"]
    }
    
    print("\n🔒 Test sans authentification (doit échouer)...")
    
    try:
        response = requests.post(url, json=payload, headers=headers, timeout=10)
        
        if response.status_code == 401:
            print("✅ Authentification correctement requise")
            return True
        else:
            print(f"❌ Erreur inattendue: {response.status_code}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        return False

def main():
    """Fonction principale."""
    print("🧪 Test de l'API Flask InDesign Automation")
    print("=" * 50)
    
    # Test avec auth
    success_with_auth = test_api_with_auth()
    
    # Test sans auth
    success_without_auth = test_api_without_auth()
    
    print("\n📋 Résumé:")
    print(f"Test avec auth: {'✅' if success_with_auth else '❌'}")
    print(f"Test sans auth: {'✅' if success_without_auth else '❌'}")
    
    if success_with_auth and success_without_auth:
        print("\n🎉 Tous les tests passent! L'API fonctionne correctement.")
    else:
        print("\n❌ Certains tests ont échoué.")

if __name__ == "__main__":
    main()