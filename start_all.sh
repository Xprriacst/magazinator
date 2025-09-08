#!/bin/bash
# Démarrage unifié: Flask (5003) + n8n (Docker, 5678) + ouverture des interfaces
# Usage: ./start_all.sh

set -e

PROJECT_DIR="/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"
FLASK_PORT=5003
N8N_PORT=5678
FLASK_LOG="$PROJECT_DIR/flask.log"

# Options
FORCE_COMPOSE=0
FORCE_NATIVE=0
if [ "$1" = "--compose-restart" ]; then
  FORCE_COMPOSE=1
elif [ "$1" = "--native" ]; then
  FORCE_NATIVE=1
fi

cd "$PROJECT_DIR"

echo "\n🚀 Démarrage du projet Magazinator"
echo "=================================="

echo "\n📁 Projet: $PROJECT_DIR"
echo "🌶️ Flask: http://127.0.0.1:$FLASK_PORT"
echo "🔄 n8n:   http://127.0.0.1:$N8N_PORT"
echo "📡 Webhook n8n: http://127.0.0.1:$N8N_PORT/webhook/indesign-webhook"

# 1) Préparation Python/venv (optionnel si venv présent)
if [ -f "venv/bin/activate" ]; then
  echo "\n🐍 Activation de l'environnement virtuel (venv)"
  # shellcheck disable=SC1091
  source venv/bin/activate || true
else
  echo "\nℹ️ Aucun venv détecté (venv/). Utilisation de python système."
fi

# 2) Vérifier que .env existe (sinon copier .env.example si dispo)
if [ ! -f .env ] && [ -f .env.example ]; then
  echo "\n🧩 .env manquant: création depuis .env.example"
  cp .env.example .env
fi

# 3) Lancer Flask (si pas déjà actif sur le port)
if lsof -i :$FLASK_PORT >/dev/null 2>&1; then
  echo "\n✅ Flask déjà actif sur le port $FLASK_PORT"
else
  echo "\n🌶️ Démarrage de Flask en arrière-plan (logs: $FLASK_LOG)"
  nohup python3 app.py > "$FLASK_LOG" 2>&1 &
  FLASK_PID=$!
  echo "Flask PID: $FLASK_PID"
fi

# Attendre que Flask réponde
echo "⏳ Attente de Flask..."
for i in {1..20}; do
  if curl -s "http://127.0.0.1:$FLASK_PORT/health" >/dev/null; then
    echo "✅ Flask OK sur http://127.0.0.1:$FLASK_PORT"
    break
  fi
  sleep 1
  if [ $i -eq 20 ]; then
    echo "❌ Flask ne répond pas sur /health. Consultez $FLASK_LOG"
    exit 1
  fi
done

# 4) Lancer n8n nativement si disponible (plus simple), sinon Docker Compose, sinon fallback Docker simple
NEED_START_N8N=0
if [ $FORCE_NATIVE -eq 1 ]; then
  echo "\n♻️ Mode forcé natif pour n8n (--native)"
  NEED_START_N8N=1
elif [ $FORCE_COMPOSE -eq 1 ]; then
  echo "\n♻️ Redémarrage forcé de n8n via Docker Compose (--compose-restart)"
  NEED_START_N8N=1
else
  if curl -s "http://127.0.0.1:$N8N_PORT/" >/dev/null; then
    echo "\n✅ n8n déjà accessible sur http://127.0.0.1:$N8N_PORT"
  else
    NEED_START_N8N=1
  fi
fi

if [ $NEED_START_N8N -eq 1 ]; then
  # a) Mode natif (prioritaire). Utilise n8n s'il existe, sinon npx n8n@latest
  if [ $FORCE_COMPOSE -eq 0 ]; then
    if [ $FORCE_NATIVE -eq 1 ]; then
      if command -v docker >/dev/null 2>&1; then
        if docker ps --format '{{.Names}}' | grep -E '^(n8n-local|n8n_app)$' >/dev/null 2>&1; then
          echo "🔻 Arrêt des conteneurs n8n (n8n-local/n8n_app) pour libérer le port 5678"
          docker stop n8n-local >/dev/null 2>&1 || true
          docker stop n8n_app  >/dev/null 2>&1 || true
        fi
      fi
    fi

    if command -v n8n >/dev/null 2>&1; then
      echo "\n🟢 Démarrage de n8n en mode natif (binaire global)"
      if [ -f "workflow-final-optimized.json" ]; then
        echo "📥 Import du workflow dans n8n local (global)..."
        n8n import:workflow --input=workflow-final-optimized.json --overwrite || true
      fi
      echo "🚀 Lancement de n8n (natif global) en arrière-plan..."
      nohup n8n start > "$PROJECT_DIR/n8n.log" 2>&1 &
    else
      echo "\n🟢 Démarrage de n8n en mode natif via npx (sans installation globale)"
      if [ -f "workflow-final-optimized.json" ]; then
        echo "📥 Import du workflow via npx..."
        npx -y n8n@latest import:workflow --input=workflow-final-optimized.json --overwrite || true
      fi
      echo "🚀 Lancement de n8n (npx) en arrière-plan..."
      nohup npx -y n8n@latest start > "$PROJECT_DIR/n8n.log" 2>&1 &
    fi

  else
    # b) Docker Compose si présent
    if [ -f "docker-compose.yml" ] && command -v docker >/dev/null 2>&1; then
      echo "\n🐳 Démarrage de n8n via Docker Compose (auto-import du workflow)..."
      # Arrêter toute ancienne instance nommée n8n-local si présente
      if docker ps -a --format '{{.Names}}' | grep -q '^n8n-local$'; then
        echo "🔻 Arrêt de l'ancien conteneur n8n-local"
        docker stop n8n-local >/dev/null || true
        docker rm n8n-local >/dev/null || true
      fi
      docker compose up -d n8n
    else
      # c) Fallback: conteneur unique
      echo "\n🐳 Lancement d'un conteneur n8n-local (fallback, sans auto-import)"
      if ! command -v docker >/dev/null 2>&1; then
        echo "❌ Docker introuvable et n8n natif indisponible. Installez au choix:"
        echo "- n8n natif: npm install -g n8n (Node.js 18+)"
        echo "- Docker Desktop + docker compose"
        exit 1
      fi
      if docker ps -a --format '{{.Names}}' | grep -q '^n8n-local$'; then
        echo "🔄 Démarrage du conteneur existant n8n-local..."
        docker start n8n-local >/dev/null
      else
        docker run -d \
          --name n8n-local \
          -p $N8N_PORT:5678 \
          -v "$HOME/.n8n:/home/node/.n8n" \
          n8nio/n8n:latest >/dev/null
      fi
    fi
  fi

  echo "⏳ Attente de n8n (jusqu'à 60s)..."
  for i in {1..60}; do
    if curl -s "http://127.0.0.1:$N8N_PORT/" >/dev/null; then
      echo "✅ n8n opérationnel sur http://127.0.0.1:$N8N_PORT"
      break
    fi
    sleep 1
    if [ $i -eq 60 ]; then
      echo "❌ n8n ne répond pas. Logs potentiels:"
      echo "- natif: $PROJECT_DIR/n8n.log"
      echo "- docker: 'docker logs n8n-local'"
      echo "- compose: 'docker compose logs n8n'"
      exit 1
    fi
  done
fi

# 5) Ouvrir les interfaces
if command -v open >/dev/null 2>&1; then
  echo "\n🌐 Ouverture de l'interface hybride et de n8n..."
  open "http://127.0.0.1:$FLASK_PORT/test_hybrid_interface.html" || true
  open "http://127.0.0.1:$N8N_PORT" || true
fi

# 6) Récapitulatif
cat <<EOF
\n🎉 Tout est prêt!
- Flask:  http://127.0.0.1:$FLASK_PORT (santé: /health)
- n8n:    http://127.0.0.1:$N8N_PORT
- Webhook: http://127.0.0.1:$N8N_PORT/webhook/indesign-webhook

Rappel important (Docker): dans les nodes n8n appelant Flask, utilisez:
  http://host.docker.internal:$FLASK_PORT
et non 127.0.0.1.

Logs Flask: $FLASK_LOG
Pour arrêter n8n: docker stop n8n-local
EOF
