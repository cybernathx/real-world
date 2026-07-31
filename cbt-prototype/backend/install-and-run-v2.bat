@echo off
setlocal enabledelayedexpansion
cd /d "c:\Users\Administrator\Desktop\All_Dummy_Projects\Java\cbt-prototype\backend"

echo ====== NPM INSTALL STARTING ======
echo Timestamp: %date% %time%
echo Current directory: %CD%
echo Node version:
node --version
echo NPM version:
npm --version

echo.
echo ====== RUNNING NPM INSTALL ======
call npm install --no-audit --no-fund 2>&1 | tee install-log.txt
set INSTALL_EXIT=%ERRORLEVEL%
echo Install exit code: %INSTALL_EXIT%

if %INSTALL_EXIT% neq 0 (
  echo Install failed
  pause
  exit /b %INSTALL_EXIT%
)

echo.
echo ====== NPM INSTALL SUCCESS ======
echo.
echo ====== LISTING node_modules ======
dir node_modules /b | head -30

echo.
echo ====== STARTING SERVER ======
call npm start 2>&1 | tee server-log.txt
