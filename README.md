# 🎨 Magazinator - Générateur de Magazines InDesign

Système automatisé de création de mises en page InDesign avec interface web Flask simple et efficace.

## 🚀 Fonctionnalités

- **Interface web intuitive** pour uploader images, texte et prompts
- **Analyse IA des prompts** pour générer des instructions de mise en page
- **Automatisation InDesign** via scripts ExtendScript
- **Templates personnalisables** pour différents styles de magazines
- **Traitement d'images** automatique avec placement intelligent
- **Export direct** des fichiers InDesign (.indd)

## 📋 Prérequis

- **Adobe InDesign** (2020 ou plus récent)
- **Python 3.8+**
- **macOS** (pour l'intégration InDesign via osascript)

## 🛠️ Installation

1. **Cloner le projet**
```bash
cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"
```

2. **Créer un environnement virtuel**
```bash
python3 -m venv venv
source venv/bin/activate
```

3. **Installer les dépendances**
```bash
pip install -r requirements.txt
```

4. **Configuration**
```bash
cp .env.example .env
# Éditer .env avec vos paramètres
```

5. **Créer les dossiers nécessaires**
```bash
mkdir -p uploads output indesign_templates
```

## 🎯 Utilisation

### 1. Démarrer l'application
```bash
python app.py
```

L'application sera accessible sur `http://localhost:5000`

### 2. Utiliser l'interface web

1. **Entrez un prompt** décrivant le style de mise en page souhaité
   - Exemple: "Créer une mise en page moderne et élégante pour un article de mode, avec des images en grand format et une typographie sophistiquée"

2. **Sélectionnez un template** InDesign (ou utilisez le template par défaut)

3. **Uploadez vos images** (formats supportés: JPG, PNG, GIF, TIFF, PSD)

4. **Ajoutez votre contenu textuel**

5. **Cliquez sur "Créer la mise en page"**

6. **Téléchargez le fichier InDesign** généré

### 3. Exemples de prompts efficaces

- **Mode & Style**: "Mise en page épurée avec beaucoup d'espace blanc, images en pleine page, typographie moderne sans-serif"
- **Technologie**: "Design futuriste avec grille modulaire, couleurs vives, typographie géométrique"
- **Magazine classique**: "Mise en page traditionnelle avec colonnes, images encadrées, typographie serif élégante"

## 🔧 Configuration avancée

### Templates InDesign personnalisés

1. Créez vos templates dans InDesign
2. Sauvegardez-les au format `.indt` dans le dossier `indesign_templates/`
3. Les templates apparaîtront automatiquement dans l'interface

### Intégration OpenAI (optionnel)

Pour une analyse IA avancée des prompts:

1. Obtenez une clé API OpenAI
2. Ajoutez-la dans votre fichier `.env`:
```
OPENAI_API_KEY=your_api_key_here
```

## 📁 Structure du projet

```
indesign-automation/
├── app.py                 # Application Flask principale
├── templates/
│   └── index.html        # Interface web
├── scripts/
│   └── indesign_automation.jsx  # Script InDesign
├── uploads/              # Images uploadées
├── output/               # Fichiers InDesign générés
├── indesign_templates/   # Templates InDesign
├── requirements.txt      # Dépendances Python
├── .env.example         # Configuration exemple
└── README.md            # Documentation
```

## 🎨 Personnalisation

### Modifier les styles de mise en page

Éditez le fichier `scripts/indesign_automation.jsx` pour:
- Ajuster les positions des éléments
- Modifier les styles typographiques
- Personnaliser les schémas de couleurs
- Ajouter de nouveaux types de mise en page

### Ajouter de nouveaux templates

1. Créez un template dans InDesign avec:
   - Marges et colonnes définies
   - Styles de paragraphe et de caractère
   - Éléments de design récurrents

2. Sauvegardez au format `.indt` dans `indesign_templates/`

## 🐛 Dépannage

### InDesign ne répond pas
- Vérifiez qu'InDesign est installé et accessible
- Assurez-vous que les scripts sont autorisés dans InDesign
- Redémarrez InDesign si nécessaire

### Erreurs de placement d'images
- Vérifiez les formats d'images supportés
- Assurez-vous que les fichiers ne sont pas corrompus
- Réduisez la taille des images si nécessaire

### Problèmes de performance
- Limitez le nombre d'images simultanées
- Optimisez la taille des images avant upload
- Fermez les autres applications gourmandes

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer:

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité
3. Committez vos changements
4. Poussez vers la branche
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🆘 Support

Pour obtenir de l'aide:
- Consultez la documentation InDesign ExtendScript
- Vérifiez les logs de l'application
- Ouvrez une issue sur GitHub

---

**Note**: Cette application nécessite Adobe InDesign et fonctionne actuellement sur macOS. Le support Windows peut être ajouté en adaptant les commandes d'exécution des scripts.
