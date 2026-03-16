#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const runsPerCommand = 3;
const recordedBaselineSeconds = 110.85;

const commands = [
  {
    label: 'full lint',
    command: 'yarn',
    args: ['lint'],
  },
  {
    label: 'changed files',
    command: process.execPath,
    args: [path.join(repoRoot, 'scripts/lint/run-oxlint.cjs'), '--changed'],
  },
  {
    label: 'packages/instantsearch.js',
    command: process.execPath,
    args: [path.join(repoRoot, 'scripts/lint/run-oxlint.cjs'), 'packages/instantsearch.js'],
  },
];

function formatSeconds(seconds) {
  return `${seconds.toFixed(2)}s`;
}

function median(values) {
  const sorted = [...values].sort((left, right) => left - right);
  return sorted[Math.floor(sorted.length / 2)];
}

console.log(`Recorded ESLint baseline (2026-03-16): ${formatSeconds(recordedBaselineSeconds)}`);

for (const { args, command, label } of commands) {
  const samples = [];

  for (let index = 0; index < runsPerCommand; index += 1) {
    const start = process.hrtime.bigint();
    const result = spawnSync(command, args, {
      cwd: repoRoot,
      stdio: 'ignore',
    });
    const end = process.hrtime.bigint();

    if (result.status !== 0) {
      process.exit(result.status || 1);
    }

    samples.push(Number(end - start) / 1e9);
  }

  const min = Math.min(...samples);
  const mean = samples.reduce((sum, sample) => sum + sample, 0) / samples.length;
  const medianValue = median(samples);
  const delta =
    label === 'full lint'
      ? ` (${((1 - mean / recordedBaselineSeconds) * 100).toFixed(1)}% vs recorded baseline)`
      : '';

  console.log(
    `${label}: min=${formatSeconds(min)} median=${formatSeconds(
      medianValue
    )} mean=${formatSeconds(mean)}${delta}`
  );
}
