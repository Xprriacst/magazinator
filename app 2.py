from flask import Flask, request, jsonify, render_template, send_file
from werkzeug.utils import secure_filename
import os
import json
import subprocess
import uuid
from datetime import datetime
import openai
from PIL import Image
import shutil
from dotenv import load_dotenv
import requests
import io

# Charger les variables d'environnement
load_dotenv()

app = Flask(__name__)
app.config['MAX_CONTENT_LENGTH'] = 50 * 1024 * 1024  # 50MB max file size
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['TEMPLATES_FOLDER'] = 'indesign_templates'
app.config['OUTPUT_FOLDER'] = 'output'

# Créer les dossiers nécessaires
for folder in [app.config['UPLOAD_FOLDER'], app.config['TEMPLATES_FOLDER'], app.config['OUTPUT_FOLDER']]:
    os.makedirs(folder, exist_ok=True)

ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'tiff', 'psd'}

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def _require_bearer_or_401():
    """Vérifie le header Authorization: Bearer <token> si API_TOKEN est défini.
    Retourne (None, None) si OK, sinon (json_response, status_code)."""
    api_token = os.getenv('API_TOKEN')
    if not api_token:
        # Aucun token requis si non configuré
        return None, None
    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
        return jsonify({'error': 'Unauthorized'}), 401
    provided = auth_header.replace('Bearer ', '', 1).strip()
    if provided != api_token:
        return jsonify({'error': 'Forbidden'}), 403
    return None, None

def _parse_image_urls_from_request(req: request):
    """Supporte JSON { image_urls: [...] }, form-data image_urls (répétés) ou string CSV."""
    urls = []
    if req.is_json:
        data = req.get_json(silent=True) or {}
        value = data.get('image_urls')
        if isinstance(value, list):
            urls.extend([str(u) for u in value])
        elif isinstance(value, str):
            urls.extend([u.strip() for u in value.split(',') if u.strip()])
    # Support form-data: image_urls (répétés)
    form_vals = req.form.getlist('image_urls')
    for v in form_vals:
        if v:
            urls.extend([u.strip() for u in str(v).split(',') if u.strip()])
    return list(dict.fromkeys(urls))  # unique, conserve l'ordre

def _download_images(urls, dest_folder):
    """Télécharge les images dans dest_folder. Retourne la liste des chemins locaux."""
    downloaded = []
    os.makedirs(dest_folder, exist_ok=True)
    for i, url in enumerate(urls):
        try:
            headers = {
                'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36'
            }
            r = requests.get(url, stream=True, timeout=20, headers=headers)
            r.raise_for_status()
            # Déterminer l'extension
            ext = None
            ct = r.headers.get('Content-Type', '').lower()
            mapping = {
                'image/jpeg': 'jpg',
                'image/jpg': 'jpg',
                'image/png': 'png',
                'image/gif': 'gif',
                'image/tiff': 'tiff',
                'image/x-tiff': 'tiff',
                'image/vnd.adobe.photoshop': 'psd'
            }
            if ct in mapping:
                ext = mapping[ct]
            # fallback depuis l'URL
            if not ext:
                from urllib.parse import urlparse
                path = urlparse(url).path
                if '.' in path:
                    ext = path.rsplit('.', 1)[1].lower()
            # Valider extension / fallback PIL
            if not ext or ext not in ALLOWED_EXTENSIONS:
                content = r.content  # utilise le buffer complet pour détection
                try:
                    img = Image.open(io.BytesIO(content))
                    fmt = (img.format or '').lower()
                    ext = 'jpg' if fmt == 'jpeg' else fmt
                    if ext not in ALLOWED_EXTENSIONS:
                        # fallback ultime
                        ext = 'jpg'
                        content = img.convert('RGB')
                except Exception:
                    # fallback ultime
                    ext = 'jpg'
                    content = None
            filename = f"image_{i+1}.{ext or 'jpg'}"
            filepath = os.path.join(dest_folder, filename)
            # écrire le contenu
            with open(filepath, 'wb') as f:
                if 'content' in locals() and isinstance(content, (bytes, bytearray)) and content:
                    f.write(content)
                else:
                    for chunk in r.iter_content(chunk_size=8192):
                        if chunk:
                            f.write(chunk)
            downloaded.append(filepath)
        except Exception as e:
            print(f"Téléchargement échoué pour {url}: {e}")
    return downloaded

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/create-layout', methods=['POST'])
def create_layout():
    try:
        # Auth (optionnelle si API_TOKEN non défini)
        err, status = _require_bearer_or_401()
        if err:
            return err, status
        # Récupérer les données du formulaire
        prompt = request.form.get('prompt', '')
        text_content = request.form.get('text_content', '')
        template_name = request.form.get('template', 'default')
        
        if not prompt:
            return jsonify({'error': 'Le prompt est requis'}), 400
        
        # Créer un ID unique pour ce projet
        project_id = str(uuid.uuid4())
        project_folder = os.path.join(app.config['UPLOAD_FOLDER'], project_id)
        os.makedirs(project_folder, exist_ok=True)
        
        # Sauvegarder les images uploadées
        uploaded_images = []
        if 'images' in request.files:
            files = request.files.getlist('images')
            for file in files:
                if file and file.filename and allowed_file(file.filename):
                    filename = secure_filename(file.filename)
                    filepath = os.path.join(project_folder, filename)
                    file.save(filepath)
                    uploaded_images.append(filepath)
        
        # Analyser le prompt avec l'IA
        layout_instructions = analyze_prompt_with_ai(prompt, text_content, len(uploaded_images))
        
        # Créer le fichier de configuration pour InDesign
        config = {
            'project_id': project_id,
            'prompt': prompt,
            'text_content': text_content,
            'images': uploaded_images,
            'template': template_name,
            'layout_instructions': layout_instructions,
            'created_at': datetime.now().isoformat()
        }
        
        config_path = os.path.join(project_folder, 'config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)
        
        # Exécuter le script InDesign
        result = execute_indesign_script(project_id, config_path)
        
        if result['success']:
            return jsonify({
                'success': True,
                'project_id': project_id,
                'message': 'Mise en page créée avec succès',
                'output_file': result.get('output_file')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Erreur lors de la création de la mise en page')
            }), 500
            
    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

@app.route('/api/create-layout-urls', methods=['POST'])
def create_layout_urls():
    """Crée une mise en page en téléchargeant des images depuis des URLs fournies."""
    try:
        # Auth (optionnelle si API_TOKEN non défini)
        err, status = _require_bearer_or_401()
        if err:
            return err, status

        # Récupérer les données
        prompt = request.form.get('prompt') or (request.get_json(silent=True) or {}).get('prompt', '')
        text_content = request.form.get('text_content') or (request.get_json(silent=True) or {}).get('text_content', '')
        template_name = request.form.get('template') or (request.get_json(silent=True) or {}).get('template', 'default')
        image_urls = _parse_image_urls_from_request(request)

        if not prompt:
            return jsonify({'error': 'Le prompt est requis'}), 400
        if not image_urls:
            return jsonify({'error': 'Aucune image fournie (image_urls)'}), 400

        # Créer projet
        project_id = str(uuid.uuid4())
        project_folder = os.path.join(app.config['UPLOAD_FOLDER'], project_id)
        os.makedirs(project_folder, exist_ok=True)

        # Télécharger les images
        downloaded_images = _download_images(image_urls, project_folder)
        if not downloaded_images:
            return jsonify({'error': 'Téléchargement des images échoué'}), 400

        # Analyser le prompt
        layout_instructions = analyze_prompt_with_ai(prompt, text_content, len(downloaded_images))

        # Écrire config
        config = {
            'project_id': project_id,
            'prompt': prompt,
            'text_content': text_content,
            'images': downloaded_images,
            'template': template_name,
            'layout_instructions': layout_instructions,
            'created_at': datetime.now().isoformat()
        }
        config_path = os.path.join(project_folder, 'config.json')
        with open(config_path, 'w', encoding='utf-8') as f:
            json.dump(config, f, ensure_ascii=False, indent=2)

        # Exécuter InDesign
        result = execute_indesign_script(project_id, config_path)
        if result['success']:
            return jsonify({
                'success': True,
                'project_id': project_id,
                'message': 'Mise en page créée avec succès',
                'output_file': result.get('output_file')
            })
        else:
            return jsonify({
                'success': False,
                'error': result.get('error', 'Erreur lors de la création de la mise en page')
            }), 500
    except Exception as e:
        return jsonify({'error': f'Erreur serveur: {str(e)}'}), 500

def analyze_prompt_with_ai(prompt, text_content, image_count):
    """Analyse le prompt avec OpenAI pour générer des instructions de mise en page"""
    try:
        # Configuration OpenAI
        api_key = os.getenv('OPENAI_API_KEY')
        if not api_key:
            print("Clé API OpenAI non configurée, utilisation des paramètres par défaut")
            return get_default_layout_instructions()
        
        openai.api_key = api_key
        
        # Prompt système pour l'analyse de mise en page
        system_prompt = """Tu es un expert en mise en page de magazines. Analyse le prompt utilisateur et génère des instructions précises pour remplir un template InDesign.

Retourne uniquement un JSON valide avec cette structure exacte:
{
  "title_text": "titre extrait du prompt ou généré",
  "title_style": {
    "font_size": 24,
    "font_family": "Arial Bold",
    "color": "#000000",
    "position": "top_center"
  },
  "text_layout": {
    "columns": 2,
    "alignment": "justified",
    "font_size": 11,
    "line_spacing": 14
  },
  "image_placement": [
    {"position": "top_right", "width": "40%", "height": "auto"},
    {"position": "bottom_left", "width": "60%", "height": "auto"}
  ],
  "color_scheme": ["#000000", "#333333", "#666666"],
  "typography": {
    "heading_font": "Arial Bold",
    "body_font": "Arial Regular"
  }
}"""
        
        user_prompt = f"""Prompt utilisateur: "{prompt}"
Contenu texte: "{text_content[:300]}..."
Nombre d'images: {image_count}

Génère des instructions de mise en page optimisées pour ce contenu."""
        
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            max_tokens=800,
            temperature=0.7
        )
        
        # Parser la réponse JSON
        ai_response = response.choices[0].message.content.strip()
        
        # Nettoyer la réponse si elle contient des backticks
        if ai_response.startswith('```json'):
            ai_response = ai_response[7:-3]
        elif ai_response.startswith('```'):
            ai_response = ai_response[3:-3]
        
        layout_instructions = json.loads(ai_response)
        
        # Validation et nettoyage des données
        return validate_and_clean_instructions(layout_instructions)
        
    except Exception as e:
        print(f"Erreur lors de l'analyse OpenAI: {e}")
        return get_default_layout_instructions()

def get_default_layout_instructions():
    """Instructions de mise en page par défaut"""
    return {
        "title_text": "Titre de l'article",
        "title_style": {
            "font_size": 24,
            "font_family": "Arial Bold",
            "color": "#000000",
            "position": "top_center"
        },
        "text_layout": {
            "columns": 2,
            "alignment": "justified",
            "font_size": 11,
            "line_spacing": 14
        },
        "image_placement": [
            {"position": "top_right", "width": "40%", "height": "auto"},
            {"position": "bottom_left", "width": "60%", "height": "auto"}
        ],
        "color_scheme": ["#000000", "#333333", "#666666"],
        "typography": {
            "heading_font": "Arial Bold",
            "body_font": "Arial Regular"
        }
    }

def validate_and_clean_instructions(instructions):
    """Valide et nettoie les instructions de mise en page"""
    default = get_default_layout_instructions()
    
    # Assurer que toutes les clés nécessaires sont présentes
    for key in default:
        if key not in instructions:
            instructions[key] = default[key]
    
    # Valider les valeurs numériques
    try:
        instructions["title_style"]["font_size"] = max(12, min(48, int(instructions["title_style"]["font_size"])))
        instructions["text_layout"]["font_size"] = max(8, min(16, int(instructions["text_layout"]["font_size"])))
        instructions["text_layout"]["line_spacing"] = max(10, min(24, int(instructions["text_layout"]["line_spacing"])))
        instructions["text_layout"]["columns"] = max(1, min(3, int(instructions["text_layout"]["columns"])))
    except (ValueError, KeyError):
        # En cas d'erreur, utiliser les valeurs par défaut
        instructions["title_style"]["font_size"] = 24
        instructions["text_layout"]["font_size"] = 11
        instructions["text_layout"]["line_spacing"] = 14
        instructions["text_layout"]["columns"] = 2
    
    return instructions

def execute_indesign_script(project_id, config_path):
    """Exécute le script InDesign pour créer la mise en page"""
    try:
        script_path = os.path.join(os.getcwd(), 'scripts', 'indesign_automation.jsx')
        
        # Nouvelle approche : JavaScript inline pour éviter les problèmes de parsing AppleScript
        # 1. On prépare app.scriptArgs dans InDesign
        # 2. On exécute notre JSX via app.doScript(File(...))
        
        # Approche hybride: AppleScript pour cibler l'app + JavaScript inline pour éviter "with arguments"
        applescript_with_js = f'''
tell application "Adobe InDesign 2025"
    do script "
        app.scriptArgs.clear();
        app.scriptArgs.setValue('config_path', '{config_path}');
        app.doScript(File('{script_path}'));
    " language javascript
end tell
'''
        
        # Écrire le script dans un fichier temporaire pour éviter les problèmes d'échappement
        tmp_dir = os.path.join(app.config['UPLOAD_FOLDER'], project_id)
        os.makedirs(tmp_dir, exist_ok=True)
        tmp_script = os.path.join(tmp_dir, 'run_indesign.applescript')
        
        with open(tmp_script, 'w', encoding='utf-8') as f:
            f.write(applescript_with_js)
        
        result = subprocess.run(['osascript', tmp_script], capture_output=True, text=True, timeout=300)
        
        if result.returncode == 0:
            output_file = os.path.join(app.config['OUTPUT_FOLDER'], f'{project_id}.indd')
            return {
                'success': True,
                'output_file': output_file,
                'message': 'Script InDesign exécuté avec succès'
            }
        else:
            return {
                'success': False,
                'error': f'Erreur script InDesign: {result.stderr}'
            }
            
    except subprocess.TimeoutExpired:
        return {
            'success': False,
            'error': 'Timeout lors de l\'exécution du script InDesign'
        }
    except Exception as e:
        return {
            'success': False,
            'error': f'Erreur lors de l\'exécution: {str(e)}'
        }

@app.route('/api/download/<project_id>')
def download_file(project_id):
    """Télécharger le fichier InDesign généré"""
    try:
        output_file = os.path.join(app.config['OUTPUT_FOLDER'], f'{project_id}.indd')
        if os.path.exists(output_file):
            return send_file(output_file, as_attachment=True)
        else:
            return jsonify({'error': 'Fichier non trouvé'}), 404
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/templates')
def get_templates():
    """Récupérer la liste des templates disponibles"""
    templates = []
    templates_dir = app.config['TEMPLATES_FOLDER']
    
    if os.path.exists(templates_dir):
        for file in os.listdir(templates_dir):
            if file.endswith('.indt'):
                templates.append({
                    'name': file.replace('.indt', ''),
                    'filename': file
                })
    
    return jsonify(templates)

if __name__ == '__main__':
    import os
    # Permettre les connexions externes pour le test
    host = os.getenv('FLASK_HOST', '0.0.0.0')
    port = int(os.getenv('FLASK_PORT', 5002))
    app.run(debug=True, host=host, port=port)
