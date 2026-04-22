#!/usr/bin/env node
// Spawns tsx so the TypeScript entrypoint runs without a build step.
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tsxBin = path.resolve(__dirname, '..', 'node_modules', '.bin', 'tsx');
const cli = path.resolve(__dirname, '..', 'src', 'cli', 'index.ts');

const child = spawn(tsxBin, [cli, ...process.argv.slice(2)], {
  stdio: 'inherit',
});
child.on('exit', (code) => process.exit(code ?? 0));
