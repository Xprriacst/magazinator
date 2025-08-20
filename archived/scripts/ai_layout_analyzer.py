"""
Module d'analyse IA avancée pour les prompts de mise en page
Utilise des techniques de NLP pour extraire des instructions précises
"""

import re
import json
from typing import Dict, List, Tuple, Optional
from PIL import Image
import os

class LayoutAnalyzer:
    """Analyseur IA pour les prompts de mise en page de magazine"""
    
    def __init__(self):
        self.style_keywords = {
            'modern': {
                'fonts': ['Arial', 'Helvetica', 'Futura'],
                'colors': ['#000000', '#333333', '#666666', '#FFFFFF'],
                'layout': 'minimal',
                'spacing': 'generous'
            },
            'classic': {
                'fonts': ['Times New Roman', 'Georgia', 'Garamond'],
                'colors': ['#2C1810', '#8B4513', '#D2B48C', '#F5F5DC'],
                'layout': 'traditional',
                'spacing': 'compact'
            },
            'fashion': {
                'fonts': ['Vogue', 'Didot', 'Bodoni'],
                'colors': ['#000000', '#FFFFFF', '#C0C0C0', '#FFD700'],
                'layout': 'asymmetric',
                'spacing': 'dramatic'
            },
            'tech': {
                'fonts': ['Roboto', 'Source Sans Pro', 'Montserrat'],
                'colors': ['#0066CC', '#00CCFF', '#333333', '#F0F0F0'],
                'layout': 'grid',
                'spacing': 'structured'
            }
        }
        
        self.layout_patterns = {
            'minimal': {
                'title_size': 32,
                'body_size': 12,
                'columns': 1,
                'image_ratio': 0.6
            },
            'traditional': {
                'title_size': 24,
                'body_size': 11,
                'columns': 2,
                'image_ratio': 0.4
            },
            'asymmetric': {
                'title_size': 36,
                'body_size': 10,
                'columns': 1,
                'image_ratio': 0.7
            },
            'grid': {
                'title_size': 28,
                'body_size': 11,
                'columns': 3,
                'image_ratio': 0.5
            }
        }

    def analyze_prompt(self, prompt: str, text_content: str, image_count: int) -> Dict:
        """Analyse complète du prompt utilisateur"""
        
        # Détecter le style principal
        detected_style = self._detect_style(prompt)
        
        # Analyser les couleurs mentionnées
        colors = self._extract_colors(prompt)
        
        # Analyser la disposition souhaitée
        layout_preferences = self._analyze_layout_preferences(prompt)
        
        # Analyser les images
        image_analysis = self._analyze_image_requirements(prompt, image_count)
        
        # Analyser le contenu textuel
        text_analysis = self._analyze_text_content(text_content)
        
        # Générer les instructions finales
        instructions = self._generate_layout_instructions(
            detected_style, colors, layout_preferences, 
            image_analysis, text_analysis
        )
        
        return instructions

    def _detect_style(self, prompt: str) -> str:
        """Détecte le style principal à partir du prompt"""
        prompt_lower = prompt.lower()
        
        style_scores = {}
        for style, keywords in {
            'modern': ['moderne', 'épuré', 'minimaliste', 'contemporain', 'clean'],
            'classic': ['classique', 'traditionnel', 'élégant', 'intemporel', 'serif'],
            'fashion': ['mode', 'fashion', 'sophistiqué', 'glamour', 'chic'],
            'tech': ['technologie', 'futuriste', 'digital', 'innovation', 'tech']
        }.items():
            score = sum(1 for keyword in keywords if keyword in prompt_lower)
            if score > 0:
                style_scores[style] = score
        
        return max(style_scores, key=style_scores.get) if style_scores else 'modern'

    def _extract_colors(self, prompt: str) -> List[str]:
        """Extrait les couleurs mentionnées dans le prompt"""
        color_map = {
            'noir': '#000000',
            'blanc': '#FFFFFF',
            'rouge': '#FF0000',
            'bleu': '#0066CC',
            'vert': '#00AA00',
            'jaune': '#FFDD00',
            'orange': '#FF8800',
            'violet': '#8800AA',
            'rose': '#FF69B4',
            'gris': '#808080',
            'or': '#FFD700',
            'argent': '#C0C0C0'
        }
        
        found_colors = []
        prompt_lower = prompt.lower()
        
        for color_name, hex_value in color_map.items():
            if color_name in prompt_lower:
                found_colors.append(hex_value)
        
        # Si aucune couleur spécifique, utiliser le schéma du style
        if not found_colors:
            return ['#000000', '#333333', '#666666']
        
        return found_colors[:4]  # Limiter à 4 couleurs max

    def _analyze_layout_preferences(self, prompt: str) -> Dict:
        """Analyse les préférences de mise en page"""
        prompt_lower = prompt.lower()
        
        preferences = {
            'image_prominence': 'medium',
            'text_density': 'medium',
            'asymmetry': False,
            'white_space': 'medium'
        }
        
        # Analyser la prominence des images
        if any(word in prompt_lower for word in ['grande image', 'image dominante', 'visuel fort']):
            preferences['image_prominence'] = 'high'
        elif any(word in prompt_lower for word in ['petite image', 'image discrète']):
            preferences['image_prominence'] = 'low'
        
        # Analyser la densité du texte
        if any(word in prompt_lower for word in ['beaucoup de texte', 'dense', 'détaillé']):
            preferences['text_density'] = 'high'
        elif any(word in prompt_lower for word in ['peu de texte', 'concis', 'minimal']):
            preferences['text_density'] = 'low'
        
        # Analyser l'asymétrie
        if any(word in prompt_lower for word in ['asymétrique', 'décentré', 'décalé']):
            preferences['asymmetry'] = True
        
        # Analyser l'espace blanc
        if any(word in prompt_lower for word in ['aéré', 'espace', 'respiration']):
            preferences['white_space'] = 'generous'
        elif any(word in prompt_lower for word in ['compact', 'dense', 'serré']):
            preferences['white_space'] = 'tight'
        
        return preferences

    def _analyze_image_requirements(self, prompt: str, image_count: int) -> Dict:
        """Analyse les exigences pour les images"""
        prompt_lower = prompt.lower()
        
        # Déterminer la disposition des images
        if image_count == 1:
            layout = 'single_dominant'
        elif image_count == 2:
            layout = 'dual_balanced'
        elif image_count >= 3:
            layout = 'gallery'
        else:
            layout = 'text_only'
        
        # Analyser le style de placement
        placement_style = 'standard'
        if any(word in prompt_lower for word in ['mosaïque', 'grille', 'grid']):
            placement_style = 'grid'
        elif any(word in prompt_lower for word in ['superposé', 'overlay']):
            placement_style = 'overlay'
        elif any(word in prompt_lower for word in ['côte à côte', 'horizontal']):
            placement_style = 'horizontal'
        
        return {
            'count': image_count,
            'layout': layout,
            'placement_style': placement_style,
            'aspect_ratio': 'auto'
        }

    def _analyze_text_content(self, text_content: str) -> Dict:
        """Analyse le contenu textuel"""
        if not text_content:
            return {'length': 'short', 'complexity': 'simple'}
        
        word_count = len(text_content.split())
        sentence_count = len([s for s in text_content.split('.') if s.strip()])
        
        # Déterminer la longueur
        if word_count < 100:
            length = 'short'
        elif word_count < 300:
            length = 'medium'
        else:
            length = 'long'
        
        # Déterminer la complexité
        avg_sentence_length = word_count / max(sentence_count, 1)
        complexity = 'complex' if avg_sentence_length > 20 else 'simple'
        
        return {
            'length': length,
            'complexity': complexity,
            'word_count': word_count,
            'estimated_lines': word_count // 10  # Approximation
        }

    def _generate_layout_instructions(self, style: str, colors: List[str], 
                                    layout_prefs: Dict, image_analysis: Dict, 
                                    text_analysis: Dict) -> Dict:
        """Génère les instructions finales de mise en page"""
        
        base_style = self.style_keywords.get(style, self.style_keywords['modern'])
        layout_pattern = self.layout_patterns.get(base_style['layout'], self.layout_patterns['minimal'])
        
        # Ajuster selon les préférences
        title_size = layout_pattern['title_size']
        if layout_prefs['text_density'] == 'high':
            title_size = max(20, title_size - 4)
        elif layout_prefs['text_density'] == 'low':
            title_size = min(40, title_size + 6)
        
        # Déterminer le nombre de colonnes
        columns = layout_pattern['columns']
        if text_analysis['length'] == 'long':
            columns = min(3, columns + 1)
        elif text_analysis['length'] == 'short':
            columns = max(1, columns - 1)
        
        # Générer le placement des images
        image_placements = self._generate_image_placements(
            image_analysis, layout_prefs, style
        )
        
        return {
            'title_style': {
                'font_size': title_size,
                'font_family': base_style['fonts'][0],
                'color': colors[0] if colors else '#000000',
                'position': 'top_center' if not layout_prefs['asymmetry'] else 'top_left'
            },
            'text_layout': {
                'columns': columns,
                'alignment': 'justified' if style == 'classic' else 'left',
                'font_size': layout_pattern['body_size'],
                'line_spacing': layout_pattern['body_size'] + 3,
                'font_family': base_style['fonts'][0]
            },
            'image_placement': image_placements,
            'color_scheme': colors or base_style['colors'],
            'typography': {
                'heading_font': base_style['fonts'][0],
                'body_font': base_style['fonts'][0]
            },
            'spacing': {
                'margins': '20mm' if layout_prefs['white_space'] == 'generous' else '15mm',
                'gutters': '8mm' if layout_prefs['white_space'] == 'generous' else '5mm'
            },
            'style_theme': style
        }

    def _generate_image_placements(self, image_analysis: Dict, 
                                 layout_prefs: Dict, style: str) -> List[Dict]:
        """Génère les placements d'images optimisés"""
        
        placements = []
        count = image_analysis['count']
        
        if count == 0:
            return placements
        
        if count == 1:
            # Image unique - placement selon le style
            if layout_prefs['image_prominence'] == 'high':
                placements.append({
                    'position': 'full_width_top',
                    'width': '100%',
                    'height': '40%'
                })
            else:
                placements.append({
                    'position': 'top_right',
                    'width': '45%',
                    'height': 'auto'
                })
        
        elif count == 2:
            if style == 'fashion':
                # Style mode - asymétrique
                placements.extend([
                    {'position': 'top_left', 'width': '60%', 'height': 'auto'},
                    {'position': 'bottom_right', 'width': '35%', 'height': 'auto'}
                ])
            else:
                # Style équilibré
                placements.extend([
                    {'position': 'top_right', 'width': '45%', 'height': 'auto'},
                    {'position': 'bottom_left', 'width': '45%', 'height': 'auto'}
                ])
        
        else:  # 3+ images
            # Disposition en grille ou mosaïque
            placements.extend([
                {'position': 'top_right', 'width': '30%', 'height': 'auto'},
                {'position': 'middle_left', 'width': '40%', 'height': 'auto'},
                {'position': 'bottom_right', 'width': '25%', 'height': 'auto'}
            ])
        
        return placements

    def get_style_suggestions(self, prompt: str) -> List[str]:
        """Retourne des suggestions de style basées sur le prompt"""
        detected = self._detect_style(prompt)
        suggestions = [detected]
        
        # Ajouter des styles complémentaires
        if detected == 'modern':
            suggestions.extend(['tech', 'fashion'])
        elif detected == 'classic':
            suggestions.extend(['modern', 'fashion'])
        elif detected == 'fashion':
            suggestions.extend(['modern', 'classic'])
        elif detected == 'tech':
            suggestions.extend(['modern', 'fashion'])
        
        return suggestions[:3]

# Fonction utilitaire pour l'intégration avec Flask
def analyze_layout_prompt(prompt: str, text_content: str = "", image_count: int = 0) -> Dict:
    """Fonction principale d'analyse pour l'intégration Flask"""
    analyzer = LayoutAnalyzer()
    return analyzer.analyze_prompt(prompt, text_content, image_count)

if __name__ == "__main__":
    # Test de l'analyseur
    test_prompt = "Créer une mise en page moderne et épurée pour un article de mode, avec des images en grand format et une typographie sophistiquée"
    test_text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua."
    
    result = analyze_layout_prompt(test_prompt, test_text, 2)
    print(json.dumps(result, indent=2, ensure_ascii=False))
