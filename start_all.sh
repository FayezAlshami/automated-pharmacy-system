#!/bin/bash

BASE_DIR="$HOME/ops/automated-pharmacy-system"

echo "Stopping old screens if they exist..."
screen -S pharm-backend -X quit 2>/dev/null
screen -S pharm-tablet -X quit 2>/dev/null
screen -S pharm-doctor -X quit 2>/dev/null
screen -S pharm-admin -X quit 2>/dev/null

echo "Pulling latest code..."
cd "$BASE_DIR" || exit 1
git pull origin main

echo "Starting backend on 8200..."
screen -dmS pharm-backend bash -c "
cd '$BASE_DIR/backend' &&
source .venv/bin/activate &&
uvicorn main:app --host 0.0.0.0 --port 8200
"

echo "Starting tablet on 8201..."
screen -dmS pharm-tablet bash -c "
cd '$BASE_DIR/patient-tablet-app' &&
npm run dev -- --host 0.0.0.0 --port 8201
"

echo "Starting doctor on 8202..."
screen -dmS pharm-doctor bash -c "
cd '$BASE_DIR/doctor-portal-app' &&
npm run dev -- --host 0.0.0.0 --port 8202
"

echo "Starting admin on 8203..."
screen -dmS pharm-admin bash -c "
cd '$BASE_DIR/admin-pharmacist-app' &&
npm run dev -- --host 0.0.0.0 --port 8203
"

echo "Done."
echo "Active screens:"
screen -ls

echo ""
echo "URLs:"
echo "Backend: http://207.180.209.25:8200/api/health"
echo "Tablet : http://207.180.209.25:8201/"
echo "Doctor : http://207.180.209.25:8202/"
echo "Admin  : http://207.180.209.25:8203/"
