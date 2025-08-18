# Guide de Création et Configuration des Templates InDesign

## 📋 **Procédure complète pour créer un nouveau template**

### 🎨 **1. Création du template dans InDesign**

#### **Étapes de base**
1. **Ouvrir InDesign** → Nouveau document
2. **Définir les dimensions** et paramètres de page
3. **Créer la mise en page** : colonnes, marges, éléments graphiques
4. **Positionner les zones de contenu**

#### **Éléments obligatoires à inclure**

##### **📝 Zones de texte avec placeholders**
Créer des blocs de texte contenant les placeholders suivants :

- **`{{TITRE}}`** → Titre principal de l'article
- **`{{SOUS-TITRE}}`** → Sous-titre/accroche  
- **`{{ARTICLE}}`** → Corps de l'article complet

##### **🖼️ Rectangles pour images**
- Créer des **rectangles vides** (pas d'images dedans)
- Les positionner et dimensionner selon la mise en page souhaitée
- **Important :** Les rectangles sont sélectionnés par index (0, 1, 2...)

#### **Exemple de structure type**
```
[Page InDesign]
┌─────────────────────────────────────┐
│  {{TITRE}}                          │ ← Bloc texte 1
│                                     │
│  {{SOUS-TITRE}}                     │ ← Bloc texte 2  
│                                     │
│  [Rectangle 0]    {{ARTICLE}}       │ ← Rectangle + Bloc texte 3
│  (image ici)     Lorem ipsum...     │
│                  Lorem ipsum...     │
│                  Lorem ipsum...     │
└─────────────────────────────────────┘
```

### 💾 **2. Sauvegarde du template**

#### **Nom du fichier**
- **Format :** `template-[nom]-[date].indt`
- **Exemples :** 
  - `template-mag-simple-1808.indt`
  - `template-corporate-2408.indt`
  - `template-newsletter-0925.indt`

#### **Emplacement**
```bash
/indesign_templates/
├── template-mag-simple-1808.indt
├── template-mag-simple-2-1808.indt
└── nouveau-template.indt  # ← Votre nouveau template
```

### 🔧 **3. Configuration du système**

#### **A. Mise à jour de l'interface web** (`templates/index.html`)

**Ajouter l'option dans le dropdown :**
```html
<select class="form-select" id="template" name="template">
    <option value="template-mag-simple-1808">Template Magazine Simple 1</option>
    <option value="template-mag-simple-2-1808">Template Magazine Simple 2</option>
    <!-- AJOUTER ICI -->
    <option value="nouveau-template">Nouveau Template</option>
</select>
```

#### **B. Configuration des scripts InDesign**

**Deux approches possibles :**

##### **Option 1 : Template avec tous les placeholders** (recommandée)
```javascript
// Dans template_simple_working.jsx et template_final_working.jsx
if (templateName.indexOf("nouveau-template") !== -1) {
    // Template avec {{TITRE}}, {{SOUS-TITRE}}, {{ARTICLE}}
    
    // 1. Remplacer "{{TITRE}}" 
    app.findTextPreferences.findWhat = "{{TITRE}}";
    app.changeTextPreferences.changeTo = config.prompt || "Nouveau titre";
    doc.changeText();
    
    // 2. Remplacer "{{SOUS-TITRE}}"
    app.findTextPreferences.findWhat = "{{SOUS-TITRE}}";
    app.changeTextPreferences.changeTo = config.subtitle || "Sous-titre";
    doc.changeText();
    
    // 3. Remplacer "{{ARTICLE}}"
    app.findTextPreferences.findWhat = "{{ARTICLE}}";
    app.changeTextPreferences.changeTo = config.text_content || "Article";
    doc.changeText();
}
```

##### **Option 2 : Template minimaliste** 
```javascript
else if (templateName.indexOf("nouveau-template-simple") !== -1) {
    // Template avec seulement {{ARTICLE}}
    app.findTextPreferences.findWhat = "{{ARTICLE}}";
    var fullText = config.prompt || "Titre";
    if (config.subtitle) {
        fullText += "\n\n" + config.subtitle;
    }
    if (config.text_content) {
        fullText += "\n\n" + config.text_content;
    }
    app.changeTextPreferences.changeTo = fullText;
    doc.changeText();
}
```

#### **C. Configuration n8n** (optionnel)
```json
// Dans n8n-form-fixed.json
"values": [
    {
        "option": "Template Magazine Simple 1",
        "value": "template-mag-simple-1808"
    },
    {
        "option": "Nouveau Template",
        "value": "nouveau-template"
    }
]
```

### 🧪 **4. Tests et validation**

#### **Test 1 : Vérification template**
```bash
# 1. Vérifier présence du fichier
ls -la indesign_templates/nouveau-template.indt

# 2. Test via interface web
open http://localhost:5002
# → Sélectionner le nouveau template
# → Remplir tous les champs
# → Générer document
```

#### **Test 2 : Vérification placeholders**
- **Observer les alertes InDesign** : "✅ {{TITRE}} remplacé: X occurrence(s)"  
- **Si 0 occurrence** → Le placeholder n'existe pas dans le template
- **Solution** → Ouvrir le template et ajouter les placeholders manquants

#### **Test 3 : Test API**
```bash
curl -X POST http://localhost:5002/api/create-layout-urls \
  -H 'Authorization: Bearer alexandreesttropbeau' \
  -H 'Content-Type: application/json' \
  -d '{
    "prompt": "Test Nouveau Template",
    "subtitle": "Sous-titre de test", 
    "text_content": "Contenu de test pour validation",
    "image_urls": ["https://picsum.photos/800/600"],
    "template": "nouveau-template"
  }'
```

### 📋 **5. Documentation**

#### **Mettre à jour NOTES_TECHNIQUES.md**
```markdown
## Templates disponibles

### nouveau-template.indt
- **Type :** Template personnalisé
- **Placeholders :**
  - {{TITRE}} → Titre principal
  - {{SOUS-TITRE}} → Sous-titre  
  - {{ARTICLE}} → Corps de l'article
- **Rectangles :** 2 zones d'images (index 0 et 1)
- **Usage :** Spécifique pour [décrire l'usage]
```

---

## 🔄 **Workflow de création rapide**

### **Checklist complète**
- [ ] **Créer template InDesign** avec placeholders {{TITRE}}, {{SOUS-TITRE}}, {{ARTICLE}}
- [ ] **Sauvegarder** en .indt dans `/indesign_templates/`
- [ ] **Ajouter option** dans `templates/index.html`
- [ ] **Configurer scripts** `template_simple_working.jsx` et `template_final_working.jsx`
- [ ] **Tester interface web** : http://localhost:5002
- [ ] **Vérifier alertes** : "✅ {{TITRE}} remplacé: 1 occurrence(s)"
- [ ] **Valider génération** : Document créé avec texte remplacé
- [ ] **Commit/Push** : Documenter le nouveau template

### **Templates types par usage**

#### **Template Magazine** 
- {{TITRE}} (grand, en haut)
- {{SOUS-TITRE}} (plus petit, accroche)  
- {{ARTICLE}} (colonnes, corps principal)
- 1-2 rectangles pour images

#### **Template Newsletter**
- {{TITRE}} (header)
- {{ARTICLE}} (contenu unique, long)
- Plusieurs petits rectangles pour illustrations

#### **Template Corporate** 
- {{TITRE}} (sobre, professionnel)
- {{SOUS-TITRE}} (tagline/résumé)
- {{ARTICLE}} (format rapport)
- Rectangle logo + rectangle image principale

---

## ⚠️ **Erreurs courantes et solutions**

### **Problème : "0 occurrence(s) remplacée"**
- **Cause :** Placeholder mal orthographié ou absent
- **Solution :** Ouvrir le template, vérifier présence exacte de `{{TITRE}}`, `{{SOUS-TITRE}}`, `{{ARTICLE}}`

### **Problème : Template non reconnu**
- **Cause :** Nom de fichier ne match pas la condition `indexOf()`
- **Solution :** Vérifier que le script contient la bonne condition

### **Problème : Image ne s'affiche pas**
- **Cause :** Pas de rectangle ou rectangle mal indexé
- **Solution :** Créer des rectangles vides dans le template

### **Problème : Mise en page cassée**
- **Cause :** Blocs de texte mal dimensionnés
- **Solution :** Agrandir les blocs texte pour accueillir plus de contenu

---

*Dernière mise à jour : 18 Août 2025*
*Guide complet pour la création de templates Magazinator*