#!/bin/bash
set -e
cd "$(dirname "$0")"

if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js et npm sont nécessaires."
  echo "Installe la version LTS depuis https://nodejs.org, puis relance ce fichier."
  read -r -p "Appuie sur Entrée pour fermer..."
  exit 1
fi

if [ ! -d node_modules ]; then
  echo "Installation des dépendances (premier lancement)..."
  npm install
fi

echo "FormaCAD Studio démarre : http://localhost:5173/"
echo "Garde cette fenêtre Terminal ouverte."
( sleep 2; open "http://localhost:5173/" ) &
npm run dev -- --host 127.0.0.1
