# Workflow n8n pour InDesign Automation

Ce workflow n8n permet d'automatiser la création de mises en page InDesign via webhook.

## 🚀 Configuration

### 1. Prérequis
- n8n installé et running sur `http://localhost:5678`
- Serveur Flask InDesign running sur `http://localhost:5002`
- InDesign 2025 installé sur le système

### 2. Installation du workflow

1. **Importer le workflow dans n8n:**
   ```bash
   # Copiez le contenu de n8n-indesign-workflow.json
   # Dans n8n: Workflows > Import from File
   ```

2. **Activer le workflow:**
   - Ouvrez le workflow dans n8n
   - Cliquez sur le toggle pour l'activer
   - Le webhook sera disponible sur: `http://localhost:5678/webhook/indesign-automation`

3. **Démarrer le serveur Flask:**
   ```bash
   cd "/path/to/indesign automation"
   source venv/bin/activate
   python app.py
   ```

## 📋 Utilisation

### Format de requête webhook

**URL:** `POST http://localhost:5678/webhook/indesign-automation`

**Body JSON:**
```json
{
  "prompt": "Créer un magazine moderne avec titre accrocheur",
  "text_content": "Votre contenu texte ici...",
  "image_urls": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ]
}
```

### Paramètres

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `prompt` | string | ✅ | Instructions pour la mise en page |
| `text_content` | string | ❌ | Contenu textuel à inclure |
| `image_urls` | array | ❌ | URLs des images à télécharger et intégrer |

### Réponse en cas de succès

```json
{
  "status": "success",
  "message": "Mise en page InDesign créée avec succès!",
  "project_id": "uuid-generated",
  "download_url": "http://localhost:5002/api/download/uuid-generated",
  "output_file": "output/uuid-generated.indd"
}
```

### Réponse en cas d'erreur

```json
{
  "status": "error",
  "message": "Erreur lors de la création de la mise en page",
  "error": "Description de l'erreur",
  "details": { ... }
}
```

## 🧪 Tests

### Test automatisé
```bash
python test_webhook.py
```

### Test manuel avec curl
```bash
curl -X POST http://localhost:5678/webhook/indesign-automation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Magazine moderne minimaliste",
    "text_content": "Article de test pour démonstration",
    "image_urls": ["https://picsum.photos/800/600?random=1"]
  }'
```

## 🔧 Architecture du workflow

```
Webhook (POST) 
    ↓
Log Data (pour debug)
    ↓
Call Flask API (/api/create-layout-urls)
    ↓
Check Success (condition)
    ↓
├─ Success → Download InDesign File → Success Response
└─ Error → Error Response
```

### Nodes détaillés

1. **Webhook:** Point d'entrée, reçoit les données JSON
2. **Log Data:** Log les données pour debug (optionnel)
3. **Call Flask API:** Appel POST vers Flask avec transformation des données
4. **Check Success:** Vérifie si `success: true` dans la réponse
5. **Download InDesign File:** Télécharge le fichier .indd généré
6. **Success/Error Response:** Retourne la réponse appropriée

## 🐛 Dépannage

### Erreurs communes

1. **"Connection refused" sur Flask**
   ```bash
   # Vérifier que Flask tourne
   curl http://localhost:5002/
   ```

2. **"Webhook not found"**
   - Vérifiez que le workflow est activé dans n8n
   - Vérifiez l'URL exacte du webhook

3. **"InDesign non trouvé"**
   - Vérifiez qu'InDesign 2025 est installé
   - Vérifiez les permissions système pour l'automation

4. **"Téléchargement des images échoué"**
   - Vérifiez la connectivité internet
   - Vérifiez que les URLs d'images sont accessibles

### Logs

- **Flask logs:** Visible dans le terminal où vous avez lancé `python app.py`
- **n8n logs:** Visible dans l'interface n8n, onglet "Executions"

## 🔒 Sécurité

- Le webhook est ouvert (pas d'authentification par défaut)
- Pour la production, ajoutez l'authentification dans n8n
- Limitez les tailles d'upload dans Flask (`MAX_CONTENT_LENGTH`)

## 📈 Extensions possibles

1. **Authentification:** Ajouter un token Bearer dans le webhook
2. **Templates multiples:** Paramètre `template` dans la requête
3. **Formats de sortie:** Support PDF, PNG en plus de .indd
4. **Notifications:** Intégrer Slack/Email pour notifier la completion
5. **Storage cloud:** Upload automatique vers S3/Google Drive

## 🆘 Support

En cas de problème:
1. Vérifiez les logs Flask et n8n
2. Testez l'API Flask directement avec `test_webhook.py`
3. Vérifiez que tous les services sont running
4. Consultez la documentation n8n pour les workflows