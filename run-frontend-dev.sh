#!/usr/bin/env bash
# Frontend hot-reload dev workflow.
#
#   Terminal A:  PORT=8000 ./run-backend.sh         # backend API on :8000
#   Terminal B:  ./run-frontend-dev.sh              # vite dev server on :5174
#
# Vite (:5174) proxies /api -> http://localhost:8000, so edits in frontend-src/
# hot-reload instantly. Open http://127.0.0.1:5174
#
# When done iterating, run `npm run build` (in frontend-src) so frontend/dist is
# refreshed — that tracked dist is what run-backend.sh serves on :8765.
set -euo pipefail

export PATH="/opt/homebrew/bin:$HOME/.local/bin:$PATH"
REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR/frontend-src"

[[ -d node_modules ]] || npm install
exec npm run dev
