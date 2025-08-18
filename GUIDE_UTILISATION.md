# 🚀 GUIDE D'UTILISATION - WORKFLOW INDESIGN AUTOMATION

## 🎯 UTILISATION RAPIDE

### Démarrage en 3 étapes

1. **Démarrer le système**
   ```bash
   cd "Indesign automation"
   ./start_with_ngrok.sh
   ```

2. **Ouvrir InDesign 2025**
   - Lancer Adobe InDesign 2025
   - Laisser l'application ouverte

3. **Utiliser via n8n ou API directe**

---

## 📡 UTILISATION VIA N8N

### Configuration du webhook
```
URL Webhook : https://VOTRE-NGROK-URL.ngrok-free.app/webhook/indesign-automation
Méthode : POST
Content-Type : application/json
```

### Format des données
```json
{
  "prompt": "Style de mise en page souhaité",
  "text_content": "Votre contenu texte",
  "image_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

### Exemples de prompts efficaces
- `"Magazine lifestyle moderne avec typographie élégante"`
- `"Flyer événementiel coloré et dynamique"`
- `"Brochure corporate minimaliste et professionnelle"`
- `"Affiche artistique avec mise en page créative"`

---

## 🔧 UTILISATION API DIRECTE

### Endpoint principal
```
POST https://VOTRE-NGROK-URL.ngrok-free.app/api/create-layout-urls
Authorization: Bearer alexandreesttropbeau
Content-Type: application/json
```

### Exemple complet
```bash
curl -X POST https://abc123.ngrok-free.app/api/create-layout-urls \
  -H "Authorization: Bearer alexandreesttropbeau" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Magazine tech moderne",
    "text_content": "Article sur les innovations...",
    "image_urls": ["https://picsum.photos/800/600"]
  }'
```

### Réponse de succès
```json
{
  "success": true,
  "project_id": "abc-123-def",
  "message": "Mise en page créée avec succès",
  "output_file": "output/abc-123-def.indd"
}
```

### Téléchargement du fichier
```
GET https://VOTRE-NGROK-URL.ngrok-free.app/api/download/PROJECT_ID
```

---

## 🧪 TESTS ET VALIDATION

### Test simple
```bash
python3 test_final_indesign.py
```

### Vérification des composants
```bash
# API accessible ?
curl http://localhost:5002/

# InDesign actif ?
osascript -e 'tell application "Adobe InDesign 2025" to get name'

# Tunnel ngrok ?
curl https://VOTRE-URL.ngrok-free.app/
```

---

## ⚠️ GESTION D'ERREURS COURANTES

### "Unauthorized" 
- Vérifier le token dans les headers : `Authorization: Bearer alexandreesttropbeau`

### "Le prompt est requis"
- S'assurer que le champ `prompt` est présent et non vide

### "Aucune image fournie"
- Vérifier que `image_urls` contient au moins une URL valide

### "Erreur script InDesign"
- S'assurer qu'InDesign 2025 est ouvert et accessible
- Redémarrer InDesign si nécessaire

### Timeout
- Images trop lourdes : réduire la taille ou le nombre
- Contenu trop long : diviser en plusieurs requêtes

---

## 📁 STRUCTURE DES FICHIERS GÉNÉRÉS

```
uploads/
└── PROJECT_ID/
    ├── config.json          # Configuration du projet
    ├── image_1.jpg          # Images téléchargées
    ├── image_2.jpg
    └── ...

output/
└── PROJECT_ID.indd          # Fichier InDesign généré
```

---

## 🎨 CONSEILS POUR DE MEILLEURS RÉSULTATS

### Prompts optimaux
- **Spécifique :** "Magazine lifestyle" > "magazine"
- **Style :** Mentionner "moderne", "élégant", "minimaliste"
- **Couleurs :** "tons chauds", "palette sombre", "couleurs vives"
- **Public :** "professionnel", "jeune", "haut de gamme"

### Images recommandées
- **Résolution :** 800x600 minimum
- **Format :** JPG/PNG (éviter GIF pour la qualité)
- **Taille :** < 10MB par image
- **Style :** Cohérent entre les images

### Contenu texte
- **Longueur :** 500-2000 mots optimal
- **Structure :** Utiliser des paragraphes courts
- **Format :** Éviter le HTML, rester en texte brut

---

## 🔄 WORKFLOW RECOMMANDÉ

1. **Préparation**
   - Définir le style souhaité
   - Rassembler les images (URLs publiques)
   - Préparer le contenu texte

2. **Exécution**
   - Envoyer la requête via n8n ou API
   - Attendre la réponse (15-30 secondes)
   - Vérifier le succès

3. **Récupération**
   - Télécharger le fichier .indd
   - Ouvrir dans InDesign pour ajustements
   - Exporter en PDF si nécessaire

4. **Ajustements** (optionnel)
   - Modifier dans InDesign manuellement
   - Relancer avec un prompt affiné
   - Tester différentes images

---

## 📊 LIMITES ACTUELLES

### Techniques
- **Concurrent projects :** 1 à la fois recommandé
- **Formats d'images :** JPG, PNG, GIF, TIFF, PSD
- **Taille max :** 50MB par image
- **Timeout :** 5 minutes par requête

### Créatives
- **Templates :** Un seul style pour l'instant
- **Layouts :** Basé sur magazine/article
- **Personnalisation :** Limitée aux instructions IA

---

## 🆘 DÉPANNAGE RAPIDE

### Le système ne répond pas
```bash
# Redémarrer tout
pkill -f "python app.py"
pkill -f ngrok
./start_with_ngrok.sh
```

### InDesign plante
```bash
# Forcer redémarrage InDesign
pkill -f "Adobe InDesign"
# Ouvrir manuellement InDesign 2025
```

### Erreurs de permission
```bash
# Vérifier les droits
chmod +x start_with_ngrok.sh
chmod +x run_tests.sh
```

### Ngrok expiré
- Vérifier que le compte ngrok est valide
- Régénérer le tunnel si nécessaire
- Mettre à jour les URLs dans n8n

---

## 📞 SUPPORT

### Logs utiles
```bash
# Logs Flask
tail -f ~/indesign_automation.log

# Logs ngrok  
tail -f ngrok.log

# Logs InDesign
cat indesign_test.log
```

### Tests de diagnostic
```bash
# Test complet
python3 test_final_indesign.py

# Test API simple
python3 test_api_simple.py

# Test n8n
python3 test_n8n_simple.py
```

---

*Guide mis à jour : 17 août 2025*