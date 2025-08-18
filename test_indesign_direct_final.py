#!/usr/bin/env python3
"""
Test direct du script InDesign final
"""

import os
import json
import subprocess
import uuid
from datetime import datetime

def test_indesign_direct():
    """Test direct du script InDesign."""
    
    # Créer une config de test
    project_id = str(uuid.uuid4())
    project_folder = f"uploads/{project_id}"
    os.makedirs(project_folder, exist_ok=True)
    
    config = {
        "project_id": project_id,
        "prompt": "TEST DIRECT SCRIPT FINAL",
        "text_content": "Ce texte va remplacer TEXTE dans le template",
        "images": [],  # Pas d'image pour ce test simple
        "created_at": datetime.now().isoformat()
    }
    
    config_path = f"{project_folder}/config.json"
    with open(config_path, 'w') as f:
        json.dump(config, f, indent=2)
    
    print(f"✅ Config créée: {config_path}")
    print(f"📁 Project ID: {project_id}")
    
    # Tester le script
    script_path = os.path.abspath("scripts/template_final_working.jsx")
    config_abs_path = os.path.abspath(config_path)
    
    print(f"🚀 Test du script InDesign...")
    print(f"📄 Script: {script_path}")
    print(f"⚙️  Config: {config_abs_path}")
    
    # Créer l'AppleScript
    applescript = f'''
tell application "Adobe InDesign 2025"
    activate
    do script (file POSIX file "{script_path}") with arguments ["{config_abs_path}"] language javascript
end tell
'''
    
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
        
        # Vérifier le fichier créé
        output_file = f"output/{project_id}.indd"
        if os.path.exists(output_file):
            print(f"🎉 SUCCÈS! Fichier créé: {output_file}")
            size = os.path.getsize(output_file)
            print(f"📏 Taille: {size} bytes")
            return True
        else:
            print(f"❌ Pas de fichier: {output_file}")
            
            # Chercher s'il y a des fichiers dans output
            if os.path.exists("output"):
                files = os.listdir("output")
                if files:
                    print(f"📂 Fichiers dans output: {files}")
                else:
                    print("📂 Dossier output vide")
            
            return False
    
    except subprocess.TimeoutExpired:
        print("⏰ Timeout")
        return False
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    os.chdir("/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation")
    success = test_indesign_direct()
    print(f"\n{'✅ SUCCÈS' if success else '❌ ÉCHEC'}")