#!/usr/bin/env python3
import requests
import json

def test_flask_api():
    """Test simple de l'API Flask"""
    
    url = "http://localhost:5002/api/create-layout-urls"
    
    # Données de test simples (sans images externes pour éviter les problèmes réseau)
    test_data = {
        "prompt": "Magazine test simple",
        "text_content": "Contenu de test basique",
        "image_urls": []  # Pas d'images pour ce test
    }
    
    print(f"Testing Flask API at: {url}")
    print(f"Data: {json.dumps(test_data, indent=2)}")
    
    try:
        response = requests.post(url, json=test_data, timeout=10)
        print(f"Status: {response.status_code}")
        print(f"Response: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            if result.get('success'):
                print("✅ API Test SUCCESS!")
                return result
            else:
                print("❌ API returned success=false")
        else:
            print("❌ API Test FAILED")
            
    except Exception as e:
        print(f"❌ Error: {e}")
    
    return None

def test_server_status():
    """Test si le serveur Flask répond"""
    try:
        response = requests.get("http://localhost:5002/", timeout=5)
        print(f"Server status: {response.status_code}")
        return response.status_code == 200
    except:
        print("❌ Server not responding")
        return False

if __name__ == "__main__":
    print("=== Simple Flask API Test ===")
    
    if test_server_status():
        print("✅ Server is running")
        test_flask_api()
    else:
        print("❌ Server is not running on http://localhost:5002")
        print("Please start Flask with: python app.py")