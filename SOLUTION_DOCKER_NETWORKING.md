# Solution Docker Networking - n8n vers Flask

## 🔧 Problème résolu

**Erreur initiale** : `connect ECONNREFUSED 127.0.0.1:5003`

**Cause** : n8n fonctionne dans un conteneur Docker, donc `127.0.0.1` et `localhost` pointent vers le conteneur lui-même, pas vers la machine hôte.

## ✅ Solution appliquée

### Configuration corrigée dans le workflow n8n :

```javascript
// Configuration Flask
const flaskConfig = {
  ip: 'host.docker.internal',
  port: 5003,
  url: 'http://host.docker.internal:5003'
};
```

### Étapes de résolution :

1. **Identification** : n8n conteneurisé ne peut pas accéder à `127.0.0.1:5003`
2. **Correction** : Utilisation de `host.docker.internal:5003` 
3. **Test** : Webhook fonctionnel après réimport du workflow
4. **Validation** : Document InDesign créé avec succès

## 📋 Points importants

- **Docker Desktop** : `host.docker.internal` permet l'accès à la machine hôte
- **Réimport nécessaire** : Les modifications du fichier JSON nécessitent un réimport dans n8n
- **Serveur Flask** : Doit tourner sur la machine hôte (port 5003)

## 🚀 Workflow final

Fichier : `n8n-workflow-webhook-final.json`
- Webhook : `http://localhost:5678/webhook/indesign-webhook`
- Flask API : `http://host.docker.internal:5003/api/create-layout-urls`

## 🔄 Processus de test

1. Serveur Flask actif : `python3 app.py`
2. n8n actif : `http://localhost:5678`
3. Workflow importé et activé
4. Test via `test_webhook.html` ou requête directe

Date de résolution : 19/08/2025 14:22
