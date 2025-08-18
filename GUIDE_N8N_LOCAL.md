# 🏠 GUIDE N8N LOCAL - INSTALLATION COMPLÈTE

## 🚀 DÉMARRAGE RAPIDE

### 1. Installation d'une seule commande
```bash
cd "Indesign automation"
./start_local_complete.sh
```

Le script va :
- ✅ Installer n8n automatiquement
- ✅ Démarrer Flask (localhost:5002)  
- ✅ Démarrer n8n (localhost:5678)
- ✅ Tout configurer automatiquement

---

## 🎯 CONFIGURATION N8N

### 2. Première utilisation
1. **Aller sur** http://localhost:5678
2. **Créer un compte** (local, pas besoin d'email)
3. **Importer le workflow** :
   - Cliquer sur **"Import"**
   - Coller le contenu de `n8n-local-workflow.json`
   - Cliquer **"Import workflow"**

### 3. Activer le workflow
- Cliquer sur **"Activate"** (bouton switch en haut à droite)
- Le workflow est maintenant actif !

---

## 🧪 TESTS

### Test via interface n8n
1. Dans n8n, cliquer sur **"Test workflow"**
2. Ou utiliser l'URL webhook directement

### Test via curl
```bash
curl -X POST http://localhost:5678/webhook/indesign-automation \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Magazine test local",
    "text_content": "Contenu créé en local",
    "image_urls": ["https://picsum.photos/800/600?random=1"]
  }'
```

---

## 📊 AVANTAGES DU MODE LOCAL

### ✅ **Performance**
- Pas de latence réseau
- Exécution instantanée
- Pas de timeouts

### ✅ **Fiabilité** 
- Pas de déconnexions
- URLs fixes qui ne changent jamais
- Contrôle total du système

### ✅ **Développement**
- Debug facile
- Logs visibles
- Modification en temps réel

### ✅ **Sécurité**
- Tout reste sur votre machine
- Pas d'exposition internet
- Données privées

---

## 🔧 URLS DE RÉFÉRENCE

```
N8N Interface:  http://localhost:5678
Flask API:      http://localhost:5002
Webhook URL:    http://localhost:5678/webhook/indesign-automation

Test API:       http://localhost:5002/api/create-layout-urls
Download:       http://localhost:5002/api/download/PROJECT_ID
```

---

## 🛠️ TROUBLESHOOTING

### Si n8n ne s'installe pas
```bash
# Installer manuellement
npm install -g n8n

# Ou avec Homebrew
brew install n8n
```

### Si les ports sont occupés
```bash
# Vérifier les ports
lsof -i :5002
lsof -i :5678

# Tuer les processus
lsof -ti:5002 | xargs kill
lsof -ti:5678 | xargs kill
```

### Si Flask ne démarre pas
```bash
cd "Indesign automation" 
source venv/bin/activate
python app.py
```

---

## 🎯 WORKFLOW PRÊT À L'EMPLOI

Le fichier `n8n-local-workflow.json` contient :
- ✅ Webhook configuré
- ✅ Authentification Flask
- ✅ Gestion d'erreurs
- ✅ Réponses formatées
- ✅ URLs locales

**Copiez-collez directement dans n8n !**

---

## 🚀 APRÈS INSTALLATION

1. **Tester** avec le curl ci-dessus
2. **Vérifier** les fichiers générés dans `uploads/` et `output/`
3. **Modifier** le workflow dans l'interface n8n si besoin
4. **Utiliser** l'URL webhook dans vos applications

**Votre système n8n local est maintenant opérationnel !** 🎉