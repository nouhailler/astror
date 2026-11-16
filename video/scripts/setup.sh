#!/usr/bin/env bash
# Installation de l'outillage local d'Astror Video Studio (une seule fois).
#   - venv Python video/.venv + piper-tts (TTS local, hors ligne)
#   - voix Piper (téléchargées depuis le dépôt public rhasspy/piper-voices)
#   - Chromium pour Playwright
# Remotion télécharge lui-même son « Chrome Headless Shell » au premier rendu.
set -euo pipefail
cd "$(dirname "$0")/../.."

PIPER_VERSION="1.8.0"
VOICES=(fr_FR-siwis-medium fr_FR-tom-medium en_GB-alba-medium)

for bin in python3 ffmpeg ffprobe; do
  command -v "$bin" >/dev/null || { echo "✗ $bin introuvable (ex. sudo apt install python3-venv ffmpeg)"; exit 1; }
done

if [ ! -x video/.venv/bin/python ]; then
  echo "→ Création du venv video/.venv"
  python3 -m venv video/.venv
fi
echo "→ piper-tts ${PIPER_VERSION}"
video/.venv/bin/pip install -q "piper-tts==${PIPER_VERSION}"

mkdir -p video/models
for v in "${VOICES[@]}"; do
  if [ -f "video/models/${v}.onnx" ] && [ -f "video/models/${v}.onnx.json" ]; then
    echo "✓ voix ${v} déjà présente"
  else
    echo "→ téléchargement de la voix ${v} (~63 Mo)"
    video/.venv/bin/python -m piper.download_voices --data-dir video/models "$v"
  fi
done

echo "→ Chromium pour Playwright"
npx playwright install chromium

echo "✓ Astror Video Studio prêt. Essayez : npm run video:generate -- --scenario astror-presentation-fr"
