@echo off
REM تشغيل الباك اند + الثلاثة فرونتات في نوافذ منفصلة (ويندوز)
REM الافتراضي: API على 8080 — يتوافق مع CORS في backend/main.py
setlocal
set "ROOT=%~dp0.."
cd /d "%ROOT%"
if not defined API_PORT set "API_PORT=8080"

echo Starting backend on port %API_PORT% ...
start "pharmacy-api" cmd /k "cd /d %ROOT%\backend && uvicorn main:app --reload --port %API_PORT%"

timeout /t 2 /nobreak >nul

echo Starting admin-pharmacist-app (5175) ...
start "admin-5175" cmd /k "cd /d %ROOT%\admin-pharmacist-app && npm run dev -- --port 5175"

echo Starting doctor-portal-app (5173) ...
start "doctor-5173" cmd /k "cd /d %ROOT%\doctor-portal-app && npm run dev -- --port 5173"

echo Starting patient-tablet-app (5174) ...
start "tablet-5174" cmd /k "cd /d %ROOT%\patient-tablet-app && npm run dev -- --port 5174"

echo.
echo Done. Open:
echo   API docs:  http://localhost:%API_PORT%/api/docs
echo   Admin:     http://localhost:5175
echo   Doctor:    http://localhost:5173
echo   Tablet:    http://localhost:5174
echo Ensure VITE_API_BASE_URL=http://localhost:%API_PORT%/api in each app .env
echo.
pause
