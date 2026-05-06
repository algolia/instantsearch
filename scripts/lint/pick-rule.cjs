#!/usr/bin/env node

const { spawnSync } = require('child_process');
const { existsSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const oxlintBin = path.join(repoRoot, 'node_modules', '.bin', 'oxlint');
const skipListPath = path.join(__dirname, 'auto-fix-skip.json');

const LINT_TARGETS = ['packages', 'scripts', 'tests', 'specs'];
const DEFAULT_MAX_FILES = 20;

// Files matching these patterns are off-limits to the auto-fix bot.
// Keep in sync with the DENY_REGEX in .github/workflows/lint-fix.yml, which
// re-checks the same list after the agent runs as defense-in-depth.
const SELECTION_EXCLUDED_PREFIXES = [
  '.github/',
  '.circleci/',
  'examples/',
  'packages/create-instantsearch-app/src/templates/',
  'packages/instantsearch-codemods/__testfixtures__/',
];

const SELECTION_EXCLUDED_PATTERNS = [
  /(^|\/)package\.json$/,
  /^yarn\.lock$/,
  /^\.oxlintrc\.json$/,
  /^lerna\.json$/,
  /(^|\/)tsconfig[^/]*\.json$/,
];

function isSelectionExcluded(filename) {
  const normalized = filename.split(path.sep).join('/');
  if (
    SELECTION_EXCLUDED_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return true;
  }
  return SELECTION_EXCLUDED_PATTERNS.some((pattern) => pattern.test(normalized));
}

function parseArgs(argv) {
  const args = { rule: 'auto', maxFiles: DEFAULT_MAX_FILES, out: null };

  function takeValue(flag, i) {
    const value = argv[i + 1];
    if (value === undefined || value.startsWith('--')) {
      throw new Error(`${flag} expects a value`);
    }
    return value;
  }

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--rule') {
      args.rule = takeValue(arg, i);
      i += 1;
    } else if (arg.startsWith('--rule=')) {
      args.rule = arg.slice('--rule='.length);
    } else if (arg === '--max-files') {
      args.maxFiles = Number(takeValue(arg, i));
      i += 1;
    } else if (arg.startsWith('--max-files=')) {
      args.maxFiles = Number(arg.slice('--max-files='.length));
    } else if (arg === '--out') {
      args.out = takeValue(arg, i);
      i += 1;
    } else if (arg.startsWith('--out=')) {
      args.out = arg.slice('--out='.length);
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }

  if (!args.rule) {
    throw new Error('--rule is required (use "auto" to pick highest-count rule)');
  }
  if (!Number.isFinite(args.maxFiles) || args.maxFiles <= 0) {
    throw new Error(`--max-files must be a positive integer (got ${args.maxFiles})`);
  }

  return args;
}

function loadSkipList() {
  if (!existsSync(skipListPath)) return new Set();
  const raw = readFileSync(skipListPath, 'utf8');
  const parsed = JSON.parse(raw);
  if (!Array.isArray(parsed)) {
    throw new Error(`${skipListPath} must contain a JSON array of rule keys`);
  }
  return new Set(parsed);
}

function runOxlintJson() {
  if (!existsSync(oxlintBin)) {
    throw new Error(`oxlint binary not found at ${oxlintBin}`);
  }

  const result = spawnSync(
    oxlintBin,
    ['--type-aware', '-f', 'json', ...LINT_TARGETS],
    { cwd: repoRoot, encoding: 'utf8', maxBuffer: 256 * 1024 * 1024 }
  );

  // oxlint exits non-zero when there are violations; that's expected, not an error
  // for our purposes. Treat empty stdout as a real failure.
  if (!result.stdout) {
    process.stderr.write(result.stderr || 'oxlint produced no output\n');
    throw new Error('oxlint produced no JSON output');
  }

  return JSON.parse(result.stdout);
}

function groupByRule(diagnostics, skipList) {
  const byRule = new Map();

  for (const diag of diagnostics) {
    if (!diag.code || !diag.filename) continue;
    if (isSelectionExcluded(diag.filename)) continue;
    if (skipList.has(diag.code)) continue;

    let bucket = byRule.get(diag.code);
    if (!bucket) {
      bucket = { rule: diag.code, total: 0, byFile: new Map() };
      byRule.set(diag.code, bucket);
    }

    bucket.total += 1;
    bucket.byFile.set(diag.filename, (bucket.byFile.get(diag.filename) || 0) + 1);
  }

  return byRule;
}

function pickAuto(byRule) {
  let pick = null;

  for (const bucket of byRule.values()) {
    if (!pick || bucket.total > pick.total) {
      pick = bucket;
    }
  }

  return pick;
}

function buildOutput(bucket, maxFiles) {
  const sortedFiles = [...bucket.byFile.entries()]
    .map(([filename, count]) => ({ filename, count }))
    .sort((a, b) => {
      if (a.count !== b.count) return b.count - a.count;
      return a.filename.localeCompare(b.filename);
    });

  const inScope = sortedFiles.slice(0, maxFiles);
  const deferred = sortedFiles.slice(maxFiles);
  const violationsInScope = inScope.reduce((sum, f) => sum + f.count, 0);

  return {
    rule: bucket.rule,
    totalViolations: bucket.total,
    totalFiles: sortedFiles.length,
    inScopeFiles: inScope.map((f) => f.filename),
    inScopeViolations: violationsInScope,
    deferredFiles: deferred.map((f) => f.filename),
    deferredViolations: bucket.total - violationsInScope,
    capHit: deferred.length > 0,
  };
}

function emit(payload, outPath) {
  const json = JSON.stringify(payload, null, 2) + '\n';
  if (outPath) {
    writeFileSync(outPath, json);
  } else {
    process.stdout.write(json);
  }
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const skipList = loadSkipList();
  const { diagnostics } = runOxlintJson();
  const byRule = groupByRule(diagnostics, skipList);

  let bucket;

  if (args.rule === 'auto') {
    bucket = pickAuto(byRule);
    if (!bucket) {
      emit({ status: 'no-violations', rule: null }, args.out);
      process.exit(0);
    }
  } else {
    bucket = byRule.get(args.rule);
    if (!bucket) {
      const reason = skipList.has(args.rule)
        ? `rule "${args.rule}" is in the skip-list (${path.relative(repoRoot, skipListPath)})`
        : `rule "${args.rule}" has no violations in scope`;
      emit({ status: 'no-violations', rule: args.rule, reason }, args.out);
      process.exit(0);
    }
  }

  const output = { status: 'ok', ...buildOutput(bucket, args.maxFiles) };
  emit(output, args.out);
}

try {
  main();
} catch (error) {
  process.stderr.write(`pick-rule: ${error.message}\n`);
  process.exit(1);
}
