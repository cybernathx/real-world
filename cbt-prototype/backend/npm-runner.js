const { spawnSync } = require('child_process');
const path = require('path');
const npmPath = path.join('C:', 'Program Files', 'nodejs', 'npm.cmd');

console.log('Using npm at', npmPath);
const result = spawnSync(npmPath, ['install', '--no-audit', '--no-fund'], {
  cwd: __dirname,
  env: process.env,
  stdio: 'inherit',
});

console.log('Exit code:', result.status);
process.exit(result.status || 0);
