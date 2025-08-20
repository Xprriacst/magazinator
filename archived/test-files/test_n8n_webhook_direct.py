#!/usr/bin/env python3
"""
Test direct du webhook n8n avec le workflow corrigé.
"""

import requests
import json
from datetime import datetime

def test_n8n_webhook():
    """Test du webhook n8n avec données complètes."""
    
    # URL du webhook n8n (à adapter selon votre instance)
    webhook_url = "https://06171c8ada56.ngrok-free.app/webhook/indesign-automation"
    
    print("🚀 TEST DU WEBHOOK N8N INDESIGN AUTOMATION")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🔗 URL: {webhook_url}")
    print()
    
    # Cas de test variés
    test_cases = [
        {
            "name": "🧪 Test magazine lifestyle",
            "data": {
                "prompt": "Magazine lifestyle moderne avec typographie élégante",
                "text_content": "Dans un monde où tout va vite, prendre le temps devient un luxe. Ce magazine explore l'art de vivre à son rythme, entre tendances actuelles et valeurs intemporelles.",
                "image_urls": [
                    "https://picsum.photos/800/600?random=100"
                ]
            }
        },
        {
            "name": "🧪 Test brochure corporate",
            "data": {
                "prompt": "Brochure corporate professionnelle et minimaliste",
                "text_content": "Notre entreprise se distingue par son innovation constante et son engagement envers l'excellence. Découvrez nos solutions qui transforment votre vision en réalité.",
                "image_urls": [
                    "https://picsum.photos/1200/800?random=200",
                    "https://picsum.photos/600/400?random=201"
                ]
            }
        },
        {
            "name": "🧪 Test avec valeurs par défaut",
            "data": {}  # Test des valeurs par défaut du workflow
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"▶️  {test_case['name']} ({i}/{len(test_cases)})")
        print("-" * 40)
        
        try:
            print("📤 Envoi vers n8n...")
            response = requests.post(
                webhook_url,
                json=test_case['data'],
                headers={'Content-Type': 'application/json'},
                timeout=180  # 3 minutes pour le workflow complet
            )
            
            print(f"📊 Status HTTP: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    result = response.json()
                    
                    if result.get('status') == 'success':
                        print("✅ SUCCÈS COMPLET!")
                        print(f"   📁 Project ID: {result.get('project_id')}")
                        print(f"   🔗 Téléchargement: {result.get('download_url')}")
                        print(f"   📄 Fichier: {result.get('output_file')}")
                        print(f"   ⏰ Timestamp: {result.get('timestamp')}")
                        results.append(True)
                    else:
                        print(f"❌ Échec du workflow: {result.get('message')}")
                        print(f"   🔍 Erreur: {result.get('error')}")
                        if result.get('troubleshooting'):
                            print(f"   💡 Conseil: {result.get('troubleshooting')}")
                        results.append(False)
                        
                except json.JSONDecodeError:
                    print(f"❌ Réponse non-JSON: {response.text[:200]}...")
                    results.append(False)
            else:
                print(f"❌ Erreur HTTP: {response.text[:200]}...")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
            results.append(False)
        
        print()
    
    # Résumé
    print("📋 RÉSUMÉ DES TESTS N8N")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results)
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"Total des tests: {total_tests}")
    print(f"Tests réussis: {passed_tests}")
    print(f"Taux de réussite: {success_rate:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 WORKFLOW N8N 100% FONCTIONNEL!")
        print("✅ Le workflow complet marche de bout en bout")
        print("🚀 Prêt pour la production!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) ont échoué")
        print("🔧 Vérifiez la configuration n8n et l'API Flask")
    
    return passed_tests == total_tests

def main():
    """Fonction principale."""
    print("🔍 Vérifications préalables...")
    
    # Vérifier que l'API Flask est accessible
    try:
        response = requests.get("https://06171c8ada56.ngrok-free.app/", timeout=10)
        print("✅ Tunnel ngrok accessible")
    except:
        print("❌ Tunnel ngrok non accessible")
        print("💡 Démarrez './start_with_ngrok.sh' d'abord")
        return False
    
    print()
    return test_n8n_webhook()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)