@echo off
cd /d "%~dp0"
echo Installing dependencies...
call npm install --no-audit --no-fund
if errorlevel 1 (
  echo Install failed with error code %errorlevel%
  exit /b %errorlevel%
)
echo.
echo Starting server...
call npm start
