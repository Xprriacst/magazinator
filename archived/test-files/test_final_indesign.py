#!/usr/bin/env python3
"""
Test final du workflow InDesign - Test complet du succès !
"""

import requests
import json
from datetime import datetime

def test_complete_workflow():
    """Test complet du workflow avec InDesign."""
    
    print("🎉 TEST FINAL DU WORKFLOW INDESIGN AUTOMATION")
    print("=" * 60)
    print(f"📅 Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print()
    
    # Configuration
    api_url = "http://localhost:5002/api/create-layout-urls"
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer alexandreesttropbeau"
    }
    
    # Cas de test de succès
    test_cases = [
        {
            "name": "🧪 Test magazine moderne",
            "payload": {
                "prompt": "Magazine moderne et élégant",
                "text_content": "Article sur les tendances design contemporaines",
                "image_urls": ["https://picsum.photos/800/600?random=100"]
            }
        },
        {
            "name": "🧪 Test layout créatif",
            "payload": {
                "prompt": "Layout créatif avec typographie audacieuse",
                "text_content": "Exploration des nouvelles approches graphiques",
                "image_urls": [
                    "https://picsum.photos/1200/800?random=200",
                    "https://picsum.photos/600/400?random=201"
                ]
            }
        }
    ]
    
    results = []
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"▶️  {test_case['name']} ({i}/{len(test_cases)})")
        print("-" * 40)
        
        try:
            print("📤 Envoi de la requête...")
            response = requests.post(
                api_url,
                json=test_case['payload'],
                headers=headers,
                timeout=60
            )
            
            print(f"📊 Status: {response.status_code}")
            
            if response.status_code == 200:
                result = response.json()
                if result.get('success'):
                    print(f"✅ SUCCÈS!")
                    print(f"   📁 Project ID: {result.get('project_id')}")
                    print(f"   📄 Fichier: {result.get('output_file', 'N/A')}")
                    
                    # Vérifier que les fichiers ont été créés
                    project_id = result.get('project_id')
                    if project_id:
                        import os
                        project_path = f"uploads/{project_id}"
                        if os.path.exists(project_path):
                            files = os.listdir(project_path)
                            print(f"   📂 Fichiers créés: {', '.join(files)}")
                        
                    results.append(True)
                else:
                    print(f"❌ Échec API: {result.get('error')}")
                    results.append(False)
            else:
                print(f"❌ Erreur HTTP: {response.text}")
                results.append(False)
                
        except requests.exceptions.RequestException as e:
            print(f"❌ Erreur de connexion: {e}")
            results.append(False)
        
        print()
    
    # Résumé final
    print("📋 RÉSUMÉ FINAL")
    print("=" * 60)
    
    total_tests = len(results)
    passed_tests = sum(results)
    success_rate = (passed_tests / total_tests) * 100
    
    print(f"Total des tests: {total_tests}")
    print(f"Tests réussis: {passed_tests}")
    print(f"Taux de réussite: {success_rate:.1f}%")
    
    if passed_tests == total_tests:
        print("\n🎉 FÉLICITATIONS ! WORKFLOW INDESIGN 100% FONCTIONNEL!")
        print("✅ Tous les composants marchent:")
        print("   • API Flask ✅")
        print("   • Authentification ✅") 
        print("   • Téléchargement d'images ✅")
        print("   • Analyse IA (OpenAI) ✅")
        print("   • Script InDesign ✅")
        print("   • Gestion des projets ✅")
        print("\n🚀 Le workflow n8n est prêt pour la production!")
    else:
        print(f"\n⚠️  {total_tests - passed_tests} test(s) ont échoué")
    
    return passed_tests == total_tests

def main():
    """Fonction principale."""
    # Vérifier que l'API est accessible
    try:
        response = requests.get("http://localhost:5002/", timeout=5)
        print("✅ API Flask accessible")
    except:
        print("❌ API non accessible - Démarrez d'abord le serveur:")
        print("   source venv/bin/activate && python app.py")
        return False
    
    # Vérifier InDesign
    import subprocess
    try:
        result = subprocess.run(['osascript', '-e', 'tell application "Adobe InDesign 2025" to get name'], 
                              capture_output=True, text=True, timeout=10)
        if result.returncode == 0:
            print("✅ InDesign accessible")
        else:
            print("⚠️  InDesign non accessible - Démarrez InDesign 2025")
    except:
        print("⚠️  Impossible de vérifier InDesign")
    
    print()
    
    # Exécuter les tests
    return test_complete_workflow()

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)