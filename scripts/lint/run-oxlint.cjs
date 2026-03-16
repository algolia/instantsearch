#!/usr/bin/env node

const { spawnSync } = require('child_process');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const oxlintBin = path.join(
  repoRoot,
  'node_modules',
  '.bin',
  process.platform === 'win32' ? 'oxlint.cmd' : 'oxlint'
);

const supportedExtensions = new Set([
  '.cjs',
  '.js',
  '.jsx',
  '.mjs',
  '.ts',
  '.tsx',
  '.vue',
]);

const nextExampleDirs = [
  'examples/react/next',
  'examples/react/next-app-router',
  'examples/react/next-routing',
];
const defaultTargets = ['packages', 'scripts', 'tests', 'specs', 'examples'];

function toPosix(filePath) {
  return filePath.split(path.sep).join('/');
}

function isInside(basePath, targetPath) {
  return (
    targetPath === basePath || targetPath.startsWith(`${basePath}/`)
  );
}

function relativeToRoot(targetPath) {
  const absolutePath = path.isAbsolute(targetPath)
    ? targetPath
    : path.resolve(process.cwd(), targetPath);

  const relativePath = toPosix(path.relative(repoRoot, absolutePath));

  return relativePath === '' ? '.' : relativePath;
}

function lintableFile(filePath) {
  return supportedExtensions.has(path.extname(filePath));
}

function readGitLines(args) {
  const result = spawnSync('git', args, {
    cwd: repoRoot,
    encoding: 'utf8',
  });

  if (result.status !== 0) {
    process.stderr.write(result.stderr || result.stdout || '');
    process.exit(result.status || 1);
  }

  return result.stdout
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
}

function getChangedFiles() {
  const mergeBase = readGitLines(['merge-base', 'HEAD', 'origin/master'])[0];

  return readGitLines([
    'diff',
    '--name-only',
    '--diff-filter=ACMR',
    mergeBase,
    'HEAD',
  ]).filter(lintableFile);
}

function getStagedFiles() {
  return readGitLines([
    'diff',
    '--cached',
    '--name-only',
    '--diff-filter=ACMR',
  ]).filter(lintableFile);
}

function normalizeInputPaths(inputPaths) {
  if (inputPaths.length === 0) {
    return defaultTargets;
  }

  const normalizedPaths = inputPaths
    .map((inputPath) => relativeToRoot(inputPath))
    .filter(Boolean);

  return normalizedPaths.includes('.') ? defaultTargets : normalizedPaths;
}

function partitionTargets(targets) {
  const exampleTargets = [];
  const rootTargets = [];
  const nextTargets = new Map();

  for (const target of targets) {
    const nextDir = nextExampleDirs.find((candidate) =>
      isInside(candidate, target)
    );

    if (nextDir) {
      const workspaceTargets = nextTargets.get(nextDir) || [];
      const relativeTarget = path.posix.relative(nextDir, target) || '.';
      workspaceTargets.push(relativeTarget);
      nextTargets.set(nextDir, workspaceTargets);
      continue;
    }

    if (isInside('examples', target)) {
      exampleTargets.push(target);
      continue;
    }

    rootTargets.push(target);
  }

  return { exampleTargets, nextTargets, rootTargets };
}

function dedupe(items) {
  return [...new Set(items)];
}

function isTopLevelTarget(target) {
  return !target.includes('/');
}

function runOxlint({ cwd, extraArgs, paths, noIgnore = false, typeAware = false }) {
  const commandArgs = [...extraArgs];

  if (typeAware && !extraArgs.includes('--type-aware')) {
    commandArgs.push('--type-aware');
  }

  if (noIgnore) {
    commandArgs.push('--no-ignore');
  }

  commandArgs.push(...dedupe(paths));

  const result = spawnSync(oxlintBin, commandArgs, {
    cwd,
    stdio: 'inherit',
  });

  return result.status || 0;
}

function runOxlintSequence(options) {
  const paths = dedupe(options.paths);

  if (paths.length > 1 && paths.every(isTopLevelTarget)) {
    let exitCode = 0;

    for (const target of paths) {
      exitCode = runOxlint({
        ...options,
        paths: [target],
      });

      if (exitCode !== 0) {
        break;
      }
    }

    return exitCode;
  }

  return runOxlint({
    ...options,
    paths,
  });
}

const rawArgs = process.argv.slice(2);
const extraArgs = [];
const inputPaths = [];
let selectionMode = null;

for (const arg of rawArgs) {
  if (arg === '--changed' || arg === '--staged') {
    selectionMode = arg.slice(2);
    continue;
  }

  if (arg.startsWith('-')) {
    extraArgs.push(arg);
    continue;
  }

  inputPaths.push(arg);
}

let targets;

if (selectionMode === 'changed') {
  targets = getChangedFiles();
} else if (selectionMode === 'staged') {
  targets = getStagedFiles();
} else {
  targets = normalizeInputPaths(inputPaths);
}

if (targets.length === 0) {
  console.log('No lintable files matched.');
  process.exit(0);
}

const { exampleTargets, nextTargets, rootTargets } = partitionTargets(targets);

let exitCode = 0;

if (rootTargets.length > 0) {
  exitCode = runOxlintSequence({
    cwd: repoRoot,
    extraArgs,
    paths: rootTargets,
    typeAware: true,
  });
}

if (exitCode === 0 && exampleTargets.length > 0) {
  exitCode = runOxlint({
    cwd: repoRoot,
    extraArgs,
    paths: exampleTargets,
  });
}

for (const [workspaceDir, workspaceTargets] of nextTargets.entries()) {
  if (exitCode !== 0) {
    break;
  }

  exitCode = runOxlint({
    cwd: path.join(repoRoot, workspaceDir),
    extraArgs,
    noIgnore: true,
    paths: workspaceTargets,
  });
}

process.exit(exitCode);
