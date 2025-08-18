#!/usr/bin/env python3
"""
Script de test pour le webhook n8n InDesign Automation
"""

import requests
import json
import time

# Configuration
N8N_WEBHOOK_URL = "http://localhost:5678/webhook/indesign-automation"  # À ajuster selon votre config n8n
FLASK_SERVER_URL = "http://localhost:5002"

def test_webhook_with_sample_data():
    """Test le webhook avec des données d'exemple"""
    
    # Données de test
    test_data = {
        "prompt": "Créer un magazine moderne avec titre accrocheur et design élégant",
        "text_content": """
        Ceci est un article de test pour démontrer les capacités d'automatisation 
        de mise en page avec InDesign. Le système utilise l'intelligence artificielle 
        pour analyser le contenu et créer automatiquement une mise en page optimisée.
        
        Cette technologie révolutionne la façon dont nous créons des documents, 
        permettant aux créateurs de se concentrer sur le contenu plutôt que sur 
        les détails techniques de la mise en page.
        """,
        "image_urls": [
            "https://picsum.photos/800/600?random=1",
            "https://picsum.photos/600/400?random=2"
        ]
    }
    
    print(f"🚀 Test du webhook n8n: {N8N_WEBHOOK_URL}")
    print(f"📄 Données envoyées: {json.dumps(test_data, indent=2)}")
    
    try:
        # Envoyer la requête au webhook
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=test_data,
            timeout=120,  # 2 minutes timeout
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        print(f"📋 Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Succès! Réponse: {json.dumps(result, indent=2)}")
            
            # Si on a un project_id, tester le téléchargement
            if result.get('project_id'):
                test_download(result['project_id'])
                
        else:
            print(f"❌ Erreur: {response.status_code}")
            print(f"📝 Réponse: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur de connexion: {e}")
        
def test_download(project_id):
    """Test le téléchargement du fichier généré"""
    download_url = f"{FLASK_SERVER_URL}/api/download/{project_id}"
    
    print(f"⬇️ Test de téléchargement: {download_url}")
    
    try:
        response = requests.get(download_url, timeout=30)
        
        if response.status_code == 200:
            filename = f"test_output_{project_id}.indd"
            with open(filename, 'wb') as f:
                f.write(response.content)
            print(f"✅ Fichier téléchargé: {filename} ({len(response.content)} bytes)")
        else:
            print(f"❌ Erreur téléchargement: {response.status_code} - {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur téléchargement: {e}")

def test_flask_direct():
    """Test direct de l'API Flask sans passer par n8n"""
    print(f"\n🔧 Test direct de l'API Flask: {FLASK_SERVER_URL}")
    
    test_data = {
        "prompt": "Magazine test direct",
        "text_content": "Contenu de test pour API Flask directe",
        "image_urls": ["https://picsum.photos/400/300?random=3"]
    }
    
    try:
        response = requests.post(
            f"{FLASK_SERVER_URL}/api/create-layout-urls",
            json=test_data,
            timeout=60,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"📊 Status Code: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ API Flask OK: {json.dumps(result, indent=2)}")
        else:
            print(f"❌ Erreur API Flask: {response.text}")
            
    except requests.exceptions.RequestException as e:
        print(f"❌ Erreur connexion Flask: {e}")

def check_servers():
    """Vérifie que les serveurs sont en ligne"""
    print("🔍 Vérification des serveurs...")
    
    # Test Flask
    try:
        response = requests.get(f"{FLASK_SERVER_URL}/", timeout=5)
        if response.status_code == 200:
            print("✅ Serveur Flask: OK")
        else:
            print(f"⚠️ Serveur Flask: Status {response.status_code}")
    except:
        print("❌ Serveur Flask: Inaccessible")
    
    # Test n8n (test générique)
    try:
        # On ne peut pas tester n8n directement sans connaître l'URL exacte
        # Mais on peut vérifier si le port est ouvert
        print("ℹ️ n8n: Vérifiez que n8n tourne sur http://localhost:5678")
    except:
        pass

if __name__ == "__main__":
    print("=" * 60)
    print("🧪 TESTS WEBHOOK N8N INDESIGN AUTOMATION")
    print("=" * 60)
    
    # Vérifications préliminaires
    check_servers()
    
    print(f"\n📋 Instructions:")
    print(f"1. Assurez-vous que n8n tourne sur http://localhost:5678")
    print(f"2. Importez le workflow depuis: n8n-indesign-workflow.json")
    print(f"3. Activez le workflow dans n8n")
    print(f"4. Vérifiez l'URL du webhook dans n8n")
    print(f"5. Ajustez N8N_WEBHOOK_URL dans ce script si nécessaire")
    
    # Test API Flask direct d'abord
    test_flask_direct()
    
    # Demander confirmation pour le test webhook
    print(f"\n🤔 Voulez-vous tester le webhook n8n? (y/N)")
    choice = input().strip().lower()
    
    if choice in ['y', 'yes', 'o', 'oui']:
        test_webhook_with_sample_data()
    else:
        print("⏭️ Test webhook ignoré")
    
    print(f"\n✨ Tests terminés!")