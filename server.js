#!/usr/bin/env node
// ESM wrapper (keeps package type=module happy) — delegates to CommonJS build
import { existsSync } from 'fs';
import { spawnSync } from 'child_process';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

if (!existsSync('./dist/server.cjs')) {
  console.log('⏳ dist/server.cjs not found — running `npm run build`...');
  const res = spawnSync('npm', ['run', 'build'], { stdio: 'inherit' });
  if (res.status !== 0) process.exit(res.status || 1);
}

require('./dist/server.cjs');
