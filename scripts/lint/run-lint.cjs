#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

const commands = [
  {
    label: 'oxlint',
    command: process.execPath,
    args: [path.join(repoRoot, 'scripts/lint/run-oxlint.cjs')],
  },
  {
    label: 'next-example',
    command: 'yarn',
    args: ['workspace', 'example-react-instantsearch-next-example', 'lint'],
  },
  {
    label: 'next-routing-example',
    command: 'yarn',
    args: [
      'workspace',
      'example-react-instantsearch-next-routing-example',
      'lint',
    ],
  },
  {
    label: 'next-app-dir-example',
    command: 'yarn',
    args: [
      'workspace',
      'example-react-instantsearch-next-app-dir-example',
      'lint',
    ],
  },
  {
    label: 'instantsearch.css',
    command: 'yarn',
    args: ['workspace', 'instantsearch.css', 'lint'],
  },
];

function run({ label, command, args }) {
  return new Promise((resolve) => {
    const chunks = [];
    const child = spawn(command, args, {
      cwd: repoRoot,
      env: { ...process.env, FORCE_COLOR: process.env.FORCE_COLOR ?? '1' },
    });

    const collect = (data) => chunks.push(data);
    child.stdout.on('data', collect);
    child.stderr.on('data', collect);

    child.on('close', (code) => {
      resolve({ label, code: code ?? 1, output: Buffer.concat(chunks) });
    });
  });
}

(async () => {
  const results = await Promise.all(commands.map(run));

  for (const { label, code, output } of results) {
    const status = code === 0 ? 'ok' : `failed (${code})`;
    process.stdout.write(`\n──── ${label}: ${status} ────\n`);
    process.stdout.write(output);
  }

  const failed = results.find((result) => result.code !== 0);
  process.exit(failed ? failed.code : 0);
})();
