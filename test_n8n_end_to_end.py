#!/usr/bin/env python3
"""
Test de bout en bout pour le workflow n8n d'automatisation InDesign.

Ce script teste l'intégralité du workflow n8n:
1. Webhook n8n -> 2. API Flask -> 3. Réponse de succès/erreur

Usage:
    python test_n8n_end_to_end.py
"""

import requests
import json
import time
import uuid
from typing import Dict, Any, Optional

# Configuration du test
N8N_WEBHOOK_URL = "https://06171c8ada56.ngrok-free.app/webhook/indesign-automation"
FLASK_API_URL = "https://06171c8ada56.ngrok-free.app/api/create-layout-urls"

# Données de test
TEST_CASES = [
    {
        "name": "Test basique avec images par défaut",
        "payload": {
            "prompt": "Magazine moderne test n8n",
            "text_content": "Article de démonstration automatique pour test e2e",
            "image_urls": ["https://picsum.photos/800/600?random=1"]
        }
    },
    {
        "name": "Test avec multiple images",
        "payload": {
            "prompt": "Layout créatif avec plusieurs images",
            "text_content": "Contenu détaillé pour test avec plusieurs images dans la mise en page",
            "image_urls": [
                "https://picsum.photos/800/600?random=2",
                "https://picsum.photos/600/400?random=3"
            ]
        }
    },
    {
        "name": "Test avec prompt complexe",
        "payload": {
            "prompt": "Magazine haut de gamme avec design sophistiqué, typographie élégante et mise en page moderne",
            "text_content": "Un article détaillé sur les tendances actuelles du design graphique et leur impact sur l'industrie créative contemporaine.",
            "image_urls": ["https://picsum.photos/1200/800?random=4"]
        }
    }
]

ERROR_TEST_CASES = [
    {
        "name": "Test sans prompt (erreur attendue)",
        "payload": {
            "text_content": "Contenu sans prompt",
            "image_urls": ["https://picsum.photos/800/600?random=5"]
        }
    },
    {
        "name": "Test sans images (erreur attendue)",
        "payload": {
            "prompt": "Test sans images",
            "text_content": "Contenu sans images"
        }
    },
    {
        "name": "Test avec URL image invalide (erreur attendue)",
        "payload": {
            "prompt": "Test URL invalide",
            "text_content": "Test avec URL non valide",
            "image_urls": ["https://invalid-url-that-does-not-exist.com/image.jpg"]
        }
    }
]

class Colors:
    """Couleurs pour l'affichage console."""
    GREEN = '\033[92m'
    RED = '\033[91m'
    YELLOW = '\033[93m'
    BLUE = '\033[94m'
    BOLD = '\033[1m'
    END = '\033[0m'

def print_header(text: str) -> None:
    """Affiche un en-tête coloré."""
    print(f"\n{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{text.center(60)}{Colors.END}")
    print(f"{Colors.BOLD}{Colors.BLUE}{'='*60}{Colors.END}\n")

def print_success(text: str) -> None:
    """Affiche un message de succès."""
    print(f"{Colors.GREEN}✓ {text}{Colors.END}")

def print_error(text: str) -> None:
    """Affiche un message d'erreur."""
    print(f"{Colors.RED}✗ {text}{Colors.END}")

def print_warning(text: str) -> None:
    """Affiche un avertissement."""
    print(f"{Colors.YELLOW}⚠ {text}{Colors.END}")

def print_info(text: str) -> None:
    """Affiche une information."""
    print(f"{Colors.BLUE}ℹ {text}{Colors.END}")

def test_direct_flask_api(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Teste directement l'API Flask."""
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(
            FLASK_API_URL,
            json=payload,
            headers=headers,
            timeout=120
        )
        
        return {
            'success': response.status_code == 200,
            'status_code': response.status_code,
            'response': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            'headers': dict(response.headers)
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
            'status_code': None
        }

def test_n8n_webhook(payload: Dict[str, Any]) -> Dict[str, Any]:
    """Teste le webhook n8n complet."""
    try:
        headers = {'Content-Type': 'application/json'}
        response = requests.post(
            N8N_WEBHOOK_URL,
            json=payload,
            headers=headers,
            timeout=180  # Plus de temps pour le workflow complet
        )
        
        return {
            'success': response.status_code == 200,
            'status_code': response.status_code,
            'response': response.json() if response.headers.get('content-type', '').startswith('application/json') else response.text,
            'headers': dict(response.headers)
        }
    except requests.exceptions.RequestException as e:
        return {
            'success': False,
            'error': str(e),
            'status_code': None
        }

def validate_success_response(response_data: Dict[str, Any]) -> bool:
    """Valide une réponse de succès."""
    required_fields = ['status', 'message', 'project_id']
    
    if not isinstance(response_data, dict):
        return False
    
    for field in required_fields:
        if field not in response_data:
            print_warning(f"Champ manquant dans la réponse: {field}")
            return False
    
    if response_data.get('status') != 'success':
        print_warning(f"Status incorrect: {response_data.get('status')}")
        return False
    
    return True

def validate_error_response(response_data: Dict[str, Any]) -> bool:
    """Valide une réponse d'erreur."""
    if not isinstance(response_data, dict):
        return False
    
    # Pour les tests d'erreur, on s'attend soit à un status "error" 
    # soit à un code de statut HTTP d'erreur (4xx/5xx)
    return (
        response_data.get('status') == 'error' or
        'error' in response_data
    )

def run_test_case(test_case: Dict[str, Any], test_type: str = "success") -> bool:
    """Exécute un cas de test complet."""
    print_info(f"Test: {test_case['name']}")
    
    # Test direct de l'API Flask
    print_info("  1. Test direct API Flask...")
    flask_result = test_direct_flask_api(test_case['payload'])
    
    if not flask_result['success']:
        if test_type == "error":
            print_success(f"    API Flask: Erreur attendue (HTTP {flask_result.get('status_code', 'N/A')})")
        else:
            print_error(f"    API Flask: Échec ({flask_result.get('error', 'Erreur inconnue')})")
            return False
    else:
        if test_type == "success":
            print_success("    API Flask: Succès")
        else:
            print_warning("    API Flask: Succès inattendu pour test d'erreur")
    
    # Test du workflow n8n complet
    print_info("  2. Test workflow n8n complet...")
    n8n_result = test_n8n_webhook(test_case['payload'])
    
    if not n8n_result['success']:
        if test_type == "error":
            print_success(f"    Workflow n8n: Erreur attendue (HTTP {n8n_result.get('status_code', 'N/A')})")
            return True
        else:
            print_error(f"    Workflow n8n: Échec ({n8n_result.get('error', 'Erreur inconnue')})")
            return False
    
    # Validation de la réponse
    response_data = n8n_result.get('response', {})
    
    if test_type == "success":
        if validate_success_response(response_data):
            print_success("    Workflow n8n: Succès - Réponse valide")
            if 'download_url' in response_data:
                print_info(f"    URL de téléchargement: {response_data['download_url']}")
            return True
        else:
            print_error("    Workflow n8n: Réponse invalide")
            print_error(f"    Réponse reçue: {json.dumps(response_data, indent=2)}")
            return False
    else:
        if validate_error_response(response_data):
            print_success("    Workflow n8n: Erreur correctement gérée")
            return True
        else:
            print_warning("    Workflow n8n: Réponse d'erreur inattendue")
            print_info(f"    Réponse: {json.dumps(response_data, indent=2)}")
            return False

def test_endpoints_availability() -> bool:
    """Teste la disponibilité des endpoints."""
    print_header("TEST DE DISPONIBILITÉ DES ENDPOINTS")
    
    endpoints = [
        ("Webhook n8n", N8N_WEBHOOK_URL),
        ("API Flask", FLASK_API_URL)
    ]
    
    all_available = True
    
    for name, url in endpoints:
        try:
            # Test simple avec une requête HEAD ou GET
            response = requests.get(url.replace('/webhook/', '/').replace('/api/create-layout-urls', '/'), timeout=10)
            if response.status_code < 500:
                print_success(f"{name}: Disponible")
            else:
                print_warning(f"{name}: Disponible mais erreur serveur (HTTP {response.status_code})")
        except requests.exceptions.RequestException as e:
            print_error(f"{name}: Non disponible ({str(e)})")
            all_available = False
    
    return all_available

def main():
    """Fonction principale du test."""
    print_header("TEST DE BOUT EN BOUT - WORKFLOW N8N INDESIGN")
    
    # Test de disponibilité
    if not test_endpoints_availability():
        print_error("Certains endpoints ne sont pas disponibles. Arrêt des tests.")
        return
    
    # Tests de succès
    print_header("TESTS DE SUCCÈS")
    success_count = 0
    total_success_tests = len(TEST_CASES)
    
    for i, test_case in enumerate(TEST_CASES, 1):
        print(f"\n--- Test de succès {i}/{total_success_tests} ---")
        if run_test_case(test_case, "success"):
            success_count += 1
        time.sleep(2)  # Pause entre les tests
    
    # Tests d'erreur
    print_header("TESTS DE GESTION D'ERREURS")
    error_count = 0
    total_error_tests = len(ERROR_TEST_CASES)
    
    for i, test_case in enumerate(ERROR_TEST_CASES, 1):
        print(f"\n--- Test d'erreur {i}/{total_error_tests} ---")
        if run_test_case(test_case, "error"):
            error_count += 1
        time.sleep(2)  # Pause entre les tests
    
    # Résumé final
    print_header("RÉSUMÉ DES TESTS")
    
    total_tests = total_success_tests + total_error_tests
    total_passed = success_count + error_count
    
    print(f"Tests de succès: {success_count}/{total_success_tests}")
    print(f"Tests d'erreur: {error_count}/{total_error_tests}")
    print(f"Total: {total_passed}/{total_tests}")
    
    if total_passed == total_tests:
        print_success("🎉 Tous les tests sont passés avec succès!")
    else:
        print_error(f"❌ {total_tests - total_passed} test(s) ont échoué")
    
    # Informations supplémentaires
    print_header("INFORMATIONS SUPPLÉMENTAIRES")
    print_info(f"Webhook n8n: {N8N_WEBHOOK_URL}")
    print_info(f"API Flask: {FLASK_API_URL}")
    print_info("Pour modifier les URLs, éditez les constantes en haut du fichier")

if __name__ == "__main__":
    main()