@echo off
cd /d "%~dp0"
set LOGFILE=%~dp0npm-debug.txt
if exist "%LOGFILE%" del /f /q "%LOGFILE%"
echo Current directory: %CD% > "%LOGFILE%"
where npm.cmd >> "%LOGFILE%" 2>&1
echo node version: >> "%LOGFILE%"
node --version >> "%LOGFILE%" 2>&1
echo npm version: >> "%LOGFILE%"
npm.cmd --version >> "%LOGFILE%" 2>&1
echo npm install test: >> "%LOGFILE%"
npm.cmd install --no-audit --no-fund >> "%LOGFILE%" 2>&1
echo Done >> "%LOGFILE%"
