#!/usr/bin/env python3
"""
Simulation complète du workflow n8n en local.
Ce script reproduit exactement ce que n8n ferait.
"""

import requests
import json
from datetime import datetime

def simulate_n8n_workflow():
    """Simule le workflow n8n complet en local."""
    
    print("🎭 SIMULATION WORKFLOW N8N COMPLET")
    print("=" * 60)
    print(f"📅 {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Configuration comme dans n8n
    api_url = "http://localhost:5002/api/create-layout-urls"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer alexandreesttropbeau"
    }
    
    # Cas de test comme n8n les recevrait
    webhook_payloads = [
        {
            "name": "🧪 Test avec données complètes",
            "data": {
                "prompt": "Magazine lifestyle moderne avec typographie élégante",
                "text_content": "Dans un monde en constante évolution, le design graphique moderne reflète notre époque. Ce magazine explore les tendances actuelles et futures.",
                "image_urls": [
                    "https://picsum.photos/800/600?random=100",
                    "https://picsum.photos/600/400?random=101"
                ]
            }
        },
        {
            "name": "🧪 Test avec valeurs par défaut n8n",
            "data": {}  # n8n utilisera les valeurs par défaut
        },
        {
            "name": "🧪 Test prompt créatif",
            "data": {
                "prompt": "Brochure corporate minimaliste et professionnelle",
                "text_content": "Notre vision : transformer vos idées en solutions innovantes. Découvrez notre approche unique du design et de la stratégie.",
                "image_urls": ["https://picsum.photos/1200/800?random=200"]
            }
        }
    ]
    
    results = []
    
    for i, test in enumerate(webhook_payloads, 1):
        print(f"🎬 ÉTAPE {i}: {test['name']}")
        print("-" * 50)
        
        # ÉTAPE 1: Webhook reçoit les données
        print("📥 1. Webhook n8n reçoit les données...")
        webhook_data = test['data']
        print(f"   Input: {json.dumps(webhook_data, indent=6)}")
        
        # ÉTAPE 2: Préparation des données (comme n8n)
        print("🔧 2. Préparation des données...")
        
        # Simulation de la logique n8n avec valeurs par défaut
        api_payload = {
            "prompt": webhook_data.get('prompt', 'Magazine moderne depuis n8n'),
            "text_content": webhook_data.get('text_content', 'Article de démonstration automatique généré par le workflow n8n'),
            "image_urls": webhook_data.get('image_urls', [
                "https://picsum.photos/800/600?random=1",
                "https://picsum.photos/600/400?random=2"
            ])
        }
        print(f"   Payload API: {json.dumps(api_payload, indent=6)}")
        
        # ÉTAPE 3: Appel de l'API Flask
        print("📞 3. Appel de l'API Flask...")
        try:
            response = requests.post(
                api_url,
                json=api_payload,
                headers=headers,
                timeout=120
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                flask_result = response.json()
                print(f"   Réponse Flask: {json.dumps(flask_result, indent=6)}")
                
                # ÉTAPE 4: Vérification du succès (nœud "Check Success")
                print("✅ 4. Vérification du succès...")
                
                if flask_result.get('success'):
                    # ÉTAPE 5: Réponse de succès (nœud "Success Response")
                    print("🎉 5. Génération de la réponse de succès...")
                    
                    final_response = {
                        "status": "success",
                        "message": "🎉 Mise en page InDesign créée avec succès!",
                        "project_id": flask_result.get('project_id'),
                        "download_url": f"http://localhost:5002/api/download/{flask_result.get('project_id')}",
                        "output_file": flask_result.get('output_file'),
                        "timestamp": datetime.now().isoformat(),
                        "workflow": "n8n-indesign-automation",
                        "generated_by": "Claude Code Assistant"
                    }
                    
                    print("✅ WORKFLOW COMPLET RÉUSSI!")
                    print(f"📄 Réponse finale:")
                    print(json.dumps(final_response, indent=6, ensure_ascii=False))
                    results.append(True)
                    
                else:
                    # ÉTAPE 5: Réponse d'erreur (nœud "Error Response")
                    print("❌ 5. Génération de la réponse d'erreur...")
                    
                    error_response = {
                        "status": "error",
                        "message": "❌ Erreur lors de la création de la mise en page",
                        "error": flask_result.get('error', 'Erreur inconnue'),
                        "timestamp": datetime.now().isoformat(),
                        "details": flask_result,
                        "troubleshooting": "Vérifiez que InDesign est ouvert et que l'API Flask fonctionne"
                    }
                    
                    print("❌ WORKFLOW TERMINÉ AVEC ERREUR")
                    print(f"📄 Réponse finale:")
                    print(json.dumps(error_response, indent=6, ensure_ascii=False))
                    results.append(False)
            else:
                print(f"❌ Erreur HTTP: {response.text[:200]}...")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
            results.append(False)
        
        print()
        print("=" * 60)
        print()
    
    # Résumé final
    print("📊 RÉSUMÉ DE LA SIMULATION N8N")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results)
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"Workflows simulés: {total_tests}")
    print(f"Workflows réussis: {passed_tests}")
    print(f"Taux de réussite: {success_rate:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 SIMULATION N8N 100% RÉUSSIE!")
        print("✅ Votre workflow n8n fonctionnera parfaitement")
        print("🚀 Système prêt pour la production!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} workflow(s) ont échoué")
    
    return passed_tests == total_tests

def main():
    """Fonction principale."""
    
    # Vérifier les prérequis
    print("🔍 Vérifications préalables...")
    try:
        response = requests.get("http://localhost:5002/", timeout=5)
        print("✅ API Flask accessible")
    except:
        print("❌ API Flask non accessible")
        print("💡 Démarrez: source venv/bin/activate && python app.py")
        return False
    
    print()
    return simulate_n8n_workflow()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)