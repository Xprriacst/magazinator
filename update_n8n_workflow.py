#!/usr/bin/env python3
"""
Script pour mettre à jour automatiquement l'URL dans le workflow n8n
"""
import json
import requests
import socket
import subprocess
import sys
import time

def get_local_ip():
    """Récupère l'IP locale"""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    try:
        s.connect(('8.8.8.8', 80))
        local_ip = s.getsockname()[0]
    except:
        local_ip = '127.0.0.1'
    finally:
        s.close()
    return local_ip

def wait_for_flask(max_attempts=30):
    """Attendre que Flask soit disponible"""
    local_ip = get_local_ip()
    url = f"http://{local_ip}:5003/api/config"
    
    for i in range(max_attempts):
        try:
            response = requests.get(url, timeout=2)
            if response.status_code == 200:
                return response.json()
        except:
            pass
        print(f"Tentative {i+1}/{max_attempts} - Flask non disponible, attente...")
        time.sleep(2)
    
    raise Exception("Flask n'est pas disponible après 60 secondes")

def update_n8n_workflow():
    """Met à jour le workflow n8n avec la nouvelle URL"""
    try:
        # Attendre que Flask soit disponible
        flask_config = wait_for_flask()
        new_url = flask_config['endpoints']['create_layout']
        
        print(f"Flask détecté à: {new_url}")
        
        # URL de l'API n8n locale
        n8n_api = "http://localhost:5678/api/v1"
        
        # Récupérer tous les workflows
        workflows_response = requests.get(f"{n8n_api}/workflows")
        
        if workflows_response.status_code != 200:
            print("Erreur: n8n n'est pas accessible")
            return False
            
        workflows = workflows_response.json()
        
        # Trouver le workflow "indesign-automation"
        target_workflow = None
        for workflow in workflows:
            if workflow['name'] == 'indesign-automation':
                target_workflow = workflow
                break
        
        if not target_workflow:
            print("Workflow 'indesign-automation' non trouvé")
            return False
        
        # Mettre à jour l'URL dans les nodes HTTP Request
        workflow_data = target_workflow
        nodes = workflow_data.get('nodes', [])
        updated = False
        
        for node in nodes:
            if node.get('type') == 'n8n-nodes-base.httpRequest':
                if 'parameters' in node and 'url' in node['parameters']:
                    old_url = node['parameters']['url']
                    if '5002' in old_url or '192.168.1.59' in old_url:
                        node['parameters']['url'] = new_url
                        print(f"URL mise à jour: {old_url} → {new_url}")
                        updated = True
        
        if updated:
            # Sauvegarder le workflow mis à jour
            update_response = requests.put(
                f"{n8n_api}/workflows/{target_workflow['id']}",
                json=workflow_data
            )
            
            if update_response.status_code == 200:
                print("✅ Workflow n8n mis à jour avec succès!")
                return True
            else:
                print(f"❌ Erreur lors de la mise à jour: {update_response.text}")
                return False
        else:
            print("ℹ️ Aucune mise à jour nécessaire")
            return True
            
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return False

if __name__ == "__main__":
    success = update_n8n_workflow()
    sys.exit(0 if success else 1)