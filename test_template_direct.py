#!/usr/bin/env python3
"""
Test direct du template sans passer par HTTP
"""

import json
import os
import uuid
from datetime import datetime

def test_template_direct():
    """Test direct du template d'Alexandre."""
    
    print("🎯 TEST DIRECT DU TEMPLATE")
    print("=" * 40)
    
    # Créer un projet de test
    project_id = str(uuid.uuid4())
    project_folder = f"uploads/{project_id}"
    os.makedirs(project_folder, exist_ok=True)
    
    print(f"📁 Project ID: {project_id}")
    
    # Créer une config simple
    config = {
        "project_id": project_id,
        "prompt": "TEST TEMPLATE DIRECT",
        "text_content": "Ce texte va remplacer 'TEXTE' dans votre template. Et l'image va s'afficher dans le rectangle.",
        "images": [],  # Pas d'image pour ce test
        "template": "template-test-1708.indt",
        "created_at": datetime.now().isoformat()
    }
    
    # Sauvegarder la config
    config_path = f"{project_folder}/config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Config créée: {config_path}")
    
    # Exécuter le script InDesign directement
    import subprocess
    
    script_path = "scripts/ultra_simple_template.jsx"
    
    applescript = f'''
tell application "Adobe InDesign 2025"
    activate
    do script (file POSIX file "{os.path.abspath(script_path)}") with arguments ["{os.path.abspath(config_path)}"] language javascript
end tell
'''
    
    print("🚀 Exécution du script InDesign...")
    print(f"📄 Script: {script_path}")
    print(f"⚙️  Config: {config_path}")
    
    try:
        result = subprocess.run(
            ['osascript', '-e', applescript],
            capture_output=True,
            text=True,
            timeout=60
        )
        
        print(f"🔄 Return code: {result.returncode}")
        
        if result.stdout:
            print(f"📤 Output: {result.stdout}")
        
        if result.stderr:
            print(f"❌ Error: {result.stderr}")
        
        # Vérifier si le fichier a été créé
        output_file = f"output/{project_id}.indd"
        if os.path.exists(output_file):
            print(f"🎉 SUCCÈS! Fichier créé: {output_file}")
            file_size = os.path.getsize(output_file)
            print(f"📏 Taille: {file_size} bytes")
        else:
            print(f"❌ Fichier non trouvé: {output_file}")
        
        return os.path.exists(output_file)
        
    except subprocess.TimeoutExpired:
        print("⏰ Timeout - InDesign prend trop de temps")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    success = test_template_direct()
    print()
    if success:
        print("🎉 Template fonctionne!")
    else:
        print("❌ Problème avec le template")