#!/usr/bin/env node
// CommonJS bootstrap for cPanel / generic Node hosting
const fs = require('fs');
const { spawnSync } = require('child_process');

if (!fs.existsSync('./dist/server.cjs')) {
  console.log('⏳ dist/server.cjs not found — running `npm run build`...');
  const res = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status || 1);
}

require('./dist/server.cjs');
