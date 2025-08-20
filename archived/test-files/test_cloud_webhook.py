#!/usr/bin/env python3
"""
Script de test pour le webhook n8n cloud
URL: https://polaris-ia.app.n8n.cloud/webhook-test/indesign-automation
"""

import requests
import json
import time

# URL du webhook n8n cloud
WEBHOOK_URL = "https://polaris-ia.app.n8n.cloud/webhook-test/indesign-automation"

def test_cloud_webhook():
    """Test le webhook n8n cloud"""
    
    print(f"🌐 Testing cloud webhook: {WEBHOOK_URL}")
    
    # Données de test
    test_data = {
        "prompt": "Magazine moderne créé via n8n cloud",
        "text_content": """
        Test d'intégration complète :
        n8n cloud → webhook → Flask local (via ngrok) → InDesign → retour n8n
        
        Ce test valide que l'architecture distribuée fonctionne correctement
        avec les composants suivants :
        - n8n hébergé sur polaris-ia.app.n8n.cloud
        - Flask local exposé via ngrok
        - InDesign 2025 local
        - Génération automatique de mise en page
        """,
        "image_urls": [
            "https://picsum.photos/800/600?random=10",
            "https://picsum.photos/600/400?random=20"
        ]
    }
    
    print(f"📤 Sending data:")
    print(json.dumps(test_data, indent=2))
    
    try:
        print(f"⏳ Calling webhook...")
        response = requests.post(
            WEBHOOK_URL,
            json=test_data,
            timeout=120,  # 2 minutes pour laisser le temps à InDesign
            headers={
                'Content-Type': 'application/json',
                'User-Agent': 'InDesign-Automation-Test/1.0'
            }
        )
        
        print(f"📊 Response Status: {response.status_code}")
        print(f"📋 Response Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            try:
                result = response.json()
                print(f"✅ SUCCESS! Response:")
                print(json.dumps(result, indent=2))
                
                # Si succès, analyser la réponse
                if result.get('status') == 'success':
                    print(f"🎉 InDesign file created successfully!")
                    if 'download_url' in result:
                        print(f"📁 Download URL: {result['download_url']}")
                    if 'project_id' in result:
                        print(f"🆔 Project ID: {result['project_id']}")
                        
                elif result.get('status') == 'error':
                    print(f"❌ Workflow reported error:")
                    print(f"   Message: {result.get('message')}")
                    print(f"   Error: {result.get('error')}")
                    
            except json.JSONDecodeError:
                print(f"⚠️ Non-JSON response:")
                print(response.text[:500])
                
        elif response.status_code == 404:
            print(f"❌ Webhook not found - check if workflow is active")
            
        elif response.status_code >= 500:
            print(f"❌ Server error - check n8n logs")
            print(f"Response: {response.text[:200]}")
            
        else:
            print(f"❌ Unexpected status code")
            print(f"Response: {response.text[:200]}")
            
    except requests.exceptions.Timeout:
        print(f"⏰ Request timed out (>2min)")
        print(f"This might mean InDesign is processing - check n8n execution logs")
        
    except requests.exceptions.ConnectionError:
        print(f"❌ Connection error - check internet connection")
        
    except Exception as e:
        print(f"❌ Unexpected error: {e}")

def test_simple_ping():
    """Test simple du webhook avec données minimales"""
    
    print(f"\n🏓 Simple ping test...")
    
    simple_data = {
        "prompt": "Test ping",
        "text_content": "Minimal test",
        "image_urls": []
    }
    
    try:
        response = requests.post(
            WEBHOOK_URL,
            json=simple_data,
            timeout=30,
            headers={'Content-Type': 'application/json'}
        )
        
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            print("✅ Webhook is reachable")
        else:
            print(f"⚠️ Webhook responded but with status {response.status_code}")
            
    except Exception as e:
        print(f"❌ Ping failed: {e}")

def show_instructions():
    """Affiche les instructions pour configurer ngrok"""
    
    print(f"""
📋 SETUP INSTRUCTIONS:

1. 🚀 Start Flask with ngrok:
   ./start_with_ngrok.sh

2. 📝 Copy the ngrok URL (example: https://abc123.ngrok.io)

3. 🔧 Update n8n workflow:
   - Open your workflow in n8n
   - Edit the "Call Flask API" node
   - Change URL from "http://localhost:5002/api/create-layout-urls"
   - To: "https://YOUR-NGROK-URL.ngrok.io/api/create-layout-urls"
   - Save and activate the workflow

4. 🧪 Run this test:
   python test_cloud_webhook.py

🔍 Troubleshooting:
- Check ngrok dashboard: http://localhost:4040
- Check n8n execution logs in the web interface
- Verify Flask is running: curl http://localhost:5002/
- Verify ngrok tunnel: curl https://YOUR-NGROK-URL.ngrok.io/

🌐 Your webhook URL: {WEBHOOK_URL}
""")

if __name__ == "__main__":
    print("=" * 60)
    print("🌐 N8N CLOUD WEBHOOK TEST")
    print("=" * 60)
    
    show_instructions()
    
    print(f"\nDo you want to test the webhook now? (y/N)")
    choice = input().strip().lower()
    
    if choice in ['y', 'yes', 'o', 'oui']:
        print(f"\nStarting tests...")
        
        # Test simple d'abord
        test_simple_ping()
        
        # Test complet
        test_cloud_webhook()
        
    else:
        print(f"⏭️ Test skipped. Run ./start_with_ngrok.sh first!")
    
    print(f"\n✨ Test completed!")