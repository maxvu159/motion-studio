#!/usr/bin/env bash
# Render on another machine (e.g. an always-on Mac mini) and pull the result back.
#
#   RENDER_HOST=<ssh alias> scripts/remote_render.sh remotion <CompositionId> <out.mp4 relative to repo> [remotion args...]
#   RENDER_HOST=<ssh alias> scripts/remote_render.sh canvas   <projects/slug>                [--jobs 4]
#
# Env:
#   RENDER_HOST   ssh alias (required)               RENDER_DIR  repo path on the host (default ~/motion-studio)
#   RENDER_BRAND  brand to sync for Remotion (default demo)
#   RENDER_INIT   shell snippet that puts node on PATH (default: load nvm if present)
# The host needs: node, ffmpeg, uv; `npm ci` in both engines; `npx playwright install chromium` for canvas.
# Media in projects/*/local is synced too (it is needed to render) but never committed.
set -euo pipefail
: "${RENDER_HOST:?set RENDER_HOST to an ssh alias}"
DIR="${RENDER_DIR:-motion-studio}"
INIT="${RENDER_INIT:-export NVM_DIR=\$HOME/.nvm; [ -s \$NVM_DIR/nvm.sh ] && . \$NVM_DIR/nvm.sh >/dev/null}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
engine="$1"; shift
rsync -a --delete --exclude node_modules --exclude 'engines/remotion/out' --exclude 'projects/*/local/frames' "$ROOT/" "$RENDER_HOST:$DIR/"
if [[ "$engine" == remotion ]]; then
  comp="$1"; out="$2"; shift 2
  ssh "$RENDER_HOST" "$INIT; cd $DIR/engines/remotion && [ -d node_modules ] || npm ci --silent; npm run -s brand -- ${RENDER_BRAND:-demo} && npx remotion render src/index.ts $comp ../../$out $* --log=error"
  mkdir -p "$(dirname "$ROOT/$out")"; scp -q "$RENDER_HOST:$DIR/$out" "$ROOT/$out"; echo "-> $out"
elif [[ "$engine" == canvas ]]; then
  proj="$1"; shift
  ssh "$RENDER_HOST" "$INIT; cd $DIR/engines/canvas && [ -d node_modules ] || npm ci --silent; node render.js ../../$proj all $*"
  scp -q "$RENDER_HOST:$DIR/$proj/local/render.mp4" "$ROOT/$proj/local/render.mp4"; echo "-> $proj/local/render.mp4"
else
  echo "engine must be remotion or canvas" >&2; exit 1
fi
