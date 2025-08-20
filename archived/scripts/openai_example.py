# Exemple d'utilisation OpenAI avec Flask
from flask import Flask, request, jsonify
import openai
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)

@app.route('/api/generate-content', methods=['POST'])
def generate_content():
    """Génère du contenu avec OpenAI"""
    try:
        data = request.get_json()
        topic = data.get('topic', '')
        style = data.get('style', 'professionnel')
        length = data.get('length', 'court')
        
        if not topic:
            return jsonify({'error': 'Topic requis'}), 400
            
        # Configuration OpenAI
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        # Prompt personnalisé
        prompt = f"""
        Écris un article de magazine sur le sujet: {topic}
        Style: {style}
        Longueur: {length}
        
        Format de sortie:
        - Titre accrocheur
        - Sous-titre explicatif
        - Article complet (300-800 mots selon la longueur)
        
        Ton: {style}, adapté à un magazine
        """
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Tu es un rédacteur de magazine expert."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=1500,
            temperature=0.7
        )
        
        content = response.choices[0].message.content
        
        # Parser la réponse pour extraire titre/contenu
        lines = content.split('\n')
        title = lines[0].replace('Titre:', '').strip()
        article = '\n'.join(lines[2:]).strip()
        
        return jsonify({
            'success': True,
            'title': title,
            'content': article,
            'topic': topic,
            'style': style
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/improve-text', methods=['POST'])
def improve_text():
    """Améliore un texte existant avec OpenAI"""
    try:
        data = request.get_json()
        text = data.get('text', '')
        improvement_type = data.get('type', 'clarity')  # clarity, style, length
        
        if not text:
            return jsonify({'error': 'Texte requis'}), 400
            
        client = openai.OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        
        prompts = {
            'clarity': 'Améliore la clarté et la lisibilité de ce texte:',
            'style': 'Améliore le style et la qualité littéraire de ce texte:',
            'length': 'Raccourcis ce texte tout en gardant les informations essentielles:',
            'expand': 'Étends ce texte avec plus de détails et d\'exemples:'
        }
        
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Tu es un expert en rédaction et édition."},
                {"role": "user", "content": f"{prompts.get(improvement_type, prompts['clarity'])} {text}"}
            ],
            max_tokens=1000,
            temperature=0.5
        )
        
        improved_text = response.choices[0].message.content
        
        return jsonify({
            'success': True,
            'original': text,
            'improved': improved_text,
            'improvement_type': improvement_type
        })
        
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

if __name__ == '__main__':
    app.run(debug=True, port=5003)