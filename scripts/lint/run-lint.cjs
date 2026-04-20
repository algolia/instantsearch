#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');

const commands = [
  ['yarn', ['format:check']],
  [process.execPath, [path.join(repoRoot, 'scripts/lint/run-oxlint.cjs')]],
  ['yarn', ['workspace', 'example-react-instantsearch-next-example', 'lint']],
  [
    'yarn',
    ['workspace', 'example-react-instantsearch-next-routing-example', 'lint'],
  ],
  [
    'yarn',
    ['workspace', 'example-react-instantsearch-next-app-dir-example', 'lint'],
  ],
  ['yarn', ['workspace', 'instantsearch.css', 'lint']],
];

for (const [command, args] of commands) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}
