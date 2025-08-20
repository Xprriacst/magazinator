#!/usr/bin/env python3
"""
Script pour corriger les URLs du workflow n8n
"""
import json
import socket

def get_local_ip():
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
    finally:
        s.close()
    return local_ip

def fix_workflow_json():
    # Lire le workflow depuis le fichier
    with open('n8n-workflow-stable.json', 'r') as f:
        workflow = json.load(f)
    
    local_ip = get_local_ip()
    new_base_url = f"http://{local_ip}:5003"
    
    print(f"🔧 IP détectée: {local_ip}")
    print(f"🔧 Nouvelle base URL: {new_base_url}")
    
    # Corriger les nodes
    updated = False
    for node in workflow.get('nodes', []):
        # Node "Création InDesign" 
        if node.get('name') == 'Création InDesign':
            if 'parameters' in node and 'url' in node['parameters']:
                old_url = node['parameters']['url']
                node['parameters']['url'] = f"{new_base_url}/api/create-layout-urls"
                print(f"✅ {node['name']}: {old_url} → {node['parameters']['url']}")
                updated = True
        
        # Node "Résultat Final" - corriger le JS
        if node.get('name') == 'Résultat Final':
            if 'parameters' in node and 'jsCode' in node['parameters']:
                old_code = node['parameters']['jsCode']
                new_code = old_code.replace(
                    'http://192.168.1.59:5002', 
                    new_base_url
                )
                if old_code != new_code:
                    node['parameters']['jsCode'] = new_code
                    print(f"✅ {node['name']}: Code JS mis à jour")
                    updated = True
    
    if updated:
        # Sauvegarder le workflow corrigé
        with open('n8n-workflow-fixed-urls.json', 'w') as f:
            json.dump(workflow, f, indent=2)
        print(f"✅ Workflow sauvegardé dans: n8n-workflow-fixed-urls.json")
        print(f"📋 Importez ce fichier dans n8n pour utiliser les bonnes URLs")
    else:
        print("ℹ️ Aucune URL à corriger trouvée")

if __name__ == "__main__":
    fix_workflow_json()