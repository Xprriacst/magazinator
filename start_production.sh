#!/bin/bash
# Production server avec gunicorn

cd "/Users/alexandreerrasti/Library/Mobile Documents/com~apple~CloudDocs/Indesign automation"

# Installer gunicorn si pas déjà fait
pip3 install gunicorn --user

# Lancer avec gunicorn (plus stable que le serveur de dev Flask)
gunicorn -w 1 -b 0.0.0.0:5002 app:app --timeout 300