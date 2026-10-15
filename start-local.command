#!/bin/bash
set -e
cd "$(dirname "$0")"
PORT=8000
if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 n'est pas installé. Installe-le puis relance ce script."
  read -r -p "Appuie sur Entrée pour fermer..."
  exit 1
fi
echo "FormaCAD Studio démarre en local sur http://localhost:$PORT"
echo "Laisse cette fenêtre Terminal ouverte pendant l'utilisation."
( sleep 1; open "http://localhost:$PORT/" ) &
python3 -m http.server "$PORT"
