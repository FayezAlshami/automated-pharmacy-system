#!/usr/bin/env bash
# تشغيل الباك اند + الثلاثة فرونتات (Git Bash / WSL / macOS/Linux)
# الاستخدام من جذر المشروع:  bash scripts/dev-all.sh
# منفذ API مخصص:            API_PORT=8000 bash scripts/dev-all.sh

set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_PORT="${API_PORT:-8000}"

# --host 0.0.0.0 حتى يصل ESP32 والأجهزة الأخرى على الشبكة المحلية (ليس فقط localhost)
(cd "$ROOT/backend" && uvicorn main:app --reload --host 0.0.0.0 --port "$API_PORT") &
sleep 2

(cd "$ROOT/admin-pharmacist-app" && npm run dev -- --port 5175) &
(cd "$ROOT/doctor-portal-app" && npm run dev -- --port 5173) &
(cd "$ROOT/patient-tablet-app" && npm run dev -- --port 5174) &

echo ""
echo "Running:"
echo "  API:    http://localhost:${API_PORT}/api/docs"
echo "  Admin:  http://localhost:5175"
echo "  Doctor: http://localhost:5173"
echo "  Tablet: http://localhost:5174"
echo "Set VITE_API_BASE_URL=http://localhost:${API_PORT}/api in each .env"
echo ""
echo "Ctrl+C stops this shell; background node processes may keep running."
wait
