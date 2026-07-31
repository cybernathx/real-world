@echo off
cd /d "%~dp0"
echo Current directory: %CD%
where npm.cmd
if errorlevel 1 (
  echo npm.cmd not found
  exit /b 1
)
echo node version:
node --version
echo npm version:
npm.cmd --version
pause
