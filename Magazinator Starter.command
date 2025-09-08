#!/bin/bash
# Double-cliquable: lance tout le projet en mode natif (Flask + n8n natif si dispo)
DIR="/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"
cd "$DIR" || exit 1
exec /bin/bash -lc "./start_all.sh --native"
