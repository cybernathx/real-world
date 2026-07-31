@echo on
cd /d "c:\Users\Administrator\Desktop\All_Dummy_Projects\Java\cbt-prototype\backend"
echo ====== Node and NPM Info ======
node --version
npm --version
echo ====== Running NPM Install ======
npm install --no-audit --no-fund
echo ====== Install complete or failed ======
echo ====== Starting server ======
npm start
