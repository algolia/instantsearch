#!/usr/bin/env node

const { spawnSync } = require('child_process');
const { existsSync, mkdirSync, readFileSync, writeFileSync } = require('fs');
const path = require('path');

const repoRoot = path.resolve(__dirname, '..', '..');
const promptDir = path.join(
  repoRoot,
  '.claude',
  'prompts',
  'architecture-refactor'
);
const runsDir = path.resolve(
  repoRoot,
  process.env.ARCHITECTURE_REFACTOR_RUNS_DIR || 'architecture-refactor-runs'
);

const stageConfig = {
  scout: {
    promptFile: 'scout.md',
    maxTurns: 50,
    allowedTools: [
      'Read',
      'Glob',
      'Grep',
      'Write',
      'Bash(git status *)',
      'Bash(git diff *)',
      'Bash(git ls-files *)',
    ],
  },
  implement: {
    promptFile: 'implement.md',
    maxTurns: 80,
    allowedTools: [
      'Read',
      'Glob',
      'Grep',
      'Edit',
      'Write',
      'Bash(git status *)',
      'Bash(git diff *)',
      'Bash(yarn install --frozen-lockfile)',
      'Bash(yarn lint:changed)',
      'Bash(yarn type-check)',
      'Bash(yarn jest --findRelatedTests *)',
    ],
  },
};

function printUsage() {
  process.stderr.write(`Usage:
  node .github/scripts/architecture-refactor.cjs resolve-request
  node .github/scripts/architecture-refactor.cjs scout --run <run-id> [--max-turns <n>]
  node .github/scripts/architecture-refactor.cjs implement <candidate-id> --run <run-id> --scout-report <path> [--max-turns <n>]
  node .github/scripts/architecture-refactor.cjs candidate-title <candidate-id> --scout-report <path>
  node .github/scripts/architecture-refactor.cjs validate-implementation --report <path>
`);
}

function fail(message) {
  process.stderr.write(`${message}\n`);
  process.exit(1);
}

function parseArgs(argv) {
  const [command, ...rest] = argv;
  const positionals = [];
  const options = {};

  for (let index = 0; index < rest.length; index++) {
    const arg = rest[index];

    if (!arg.startsWith('--')) {
      positionals.push(arg);
      continue;
    }

    const [name, inlineValue] = arg.slice(2).split('=');
    const next = rest[index + 1];
    const value =
      inlineValue !== undefined
        ? inlineValue
        : next && !next.startsWith('--')
        ? (index++, next)
        : true;

    options[name] = value;
  }

  return { command, options, positionals };
}

function optionNumber(options, name, defaultValue) {
  const value = options[name];

  if (value === undefined || value === true) {
    return defaultValue;
  }

  return positiveInteger(value, `--${name}`);
}

function positiveInteger(value, label) {
  const number = Number(value);

  if (!Number.isInteger(number) || number < 1) {
    fail(`${label} must be a positive integer.`);
  }

  return number;
}

function envValue(name) {
  return process.env[name] || '';
}

function ensureActorCanRun() {
  const eventName = envValue('EVENT_NAME');

  if (eventName === 'schedule') {
    return;
  }

  const repo = envValue('REPO');
  const actor = envValue('ACTOR');

  if (!repo || !actor) {
    fail('Missing REPO or ACTOR for permission check.');
  }

  const permission = run(
    'gh',
    [
      'api',
      `repos/${repo}/collaborators/${actor}/permission`,
      '--jq',
      '.permission',
    ],
    { allowFailure: true }
  ).stdout.trim();

  if (!['admin', 'maintain', 'write'].includes(permission)) {
    fail(
      `${actor} cannot run architecture refactor actions (${
        permission || 'none'
      }).`
    );
  }
}

function parseCommentCommand(commentBody) {
  const [command, candidateId, ...extra] = commentBody.trim().split(/\s+/);

  if (command !== '/implement') {
    fail(`Unsupported command: ${command || '<empty>'}`);
  }

  if (extra.length > 0) {
    fail('Unexpected extra command text. Use: /implement candidate-1');
  }

  return candidateId || '';
}

function resolveRequest() {
  ensureActorCanRun();

  const eventName = envValue('EVENT_NAME');
  let stage = envValue('INPUT_STAGE');
  let issueNumber = envValue('INPUT_ISSUE_NUMBER');
  let candidateId = envValue('INPUT_CANDIDATE_ID');
  let maxTurns = envValue('INPUT_MAX_TURNS');

  if (eventName === 'schedule') {
    stage = 'scout';
    issueNumber = '';
    candidateId = '';
    maxTurns = '';
  }

  if (eventName === 'issue_comment') {
    stage = 'implement';
    issueNumber = envValue('EVENT_ISSUE_NUMBER');
    candidateId = parseCommentCommand(envValue('COMMENT_BODY'));
  }

  if (!Object.prototype.hasOwnProperty.call(stageConfig, stage)) {
    fail('stage must be scout or implement.');
  }

  maxTurns = maxTurns
    ? positiveInteger(maxTurns, 'max_turns')
    : stageConfig[stage].maxTurns;

  if (stage === 'implement') {
    if (!/^[0-9]+$/.test(issueNumber)) {
      fail('issue_number is required for implement.');
    }

    if (!/^candidate-[0-9]+$/.test(candidateId)) {
      fail('candidate_id must look like candidate-1.');
    }
  }

  process.stdout.write(`stage=${stage}\n`);
  process.stdout.write(`issue_number=${issueNumber}\n`);
  process.stdout.write(`candidate_id=${candidateId}\n`);
  process.stdout.write(`max_turns=${maxTurns}\n`);
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: repoRoot,
    encoding: 'utf8',
    stdio: options.stdio || 'pipe',
  });

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0 && options.allowFailure !== true) {
    process.stderr.write(result.stderr || result.stdout || '');
    process.exit(result.status || 1);
  }

  return result;
}

function outputLines(result) {
  return result.stdout.split('\n').filter(Boolean);
}

function gitChangedFiles() {
  return Array.from(
    new Set([
      ...outputLines(run('git', ['diff', '--name-only'])),
      ...outputLines(run('git', ['diff', '--staged', '--name-only'])),
      ...outputLines(
        run('git', ['ls-files', '--others', '--exclude-standard'])
      ),
    ])
  ).sort();
}

function ensureRunId(options) {
  if (!options.run || typeof options.run !== 'string') {
    fail('Missing required option: --run <run-id>');
  }

  return options.run;
}

function ensureRunDirectory(runId) {
  const runDir = path.join(runsDir, runId);
  mkdirSync(runDir, { recursive: true });

  return runDir;
}

function resolveInputPath(inputPath) {
  return path.isAbsolute(inputPath)
    ? inputPath
    : path.resolve(process.cwd(), inputPath);
}

function importReport(inputPath, targetPath) {
  if (!inputPath || typeof inputPath !== 'string') {
    fail(`Missing report input for ${path.basename(targetPath)}`);
  }

  const resolvedInputPath = resolveInputPath(inputPath);

  if (!existsSync(resolvedInputPath)) {
    fail(`Report file does not exist: ${resolvedInputPath}`);
  }

  const content = readFileSync(resolvedInputPath, 'utf8');
  writeFileSync(targetPath, content);

  return content;
}

function readTemplate(fileName) {
  const filePath = path.join(promptDir, fileName);

  if (!existsSync(filePath)) {
    fail(`Missing prompt template: ${path.relative(repoRoot, filePath)}`);
  }

  return readFileSync(filePath, 'utf8');
}

function renderTemplate(fileName, values) {
  const template = readTemplate(fileName);

  return template.replace(/\{\{([A-Z0-9_]+)\}\}/g, (_, key) => {
    if (!Object.prototype.hasOwnProperty.call(values, key)) {
      fail(`Missing prompt value: ${key}`);
    }

    return values[key];
  });
}

function writePrompt(runDir, name, prompt) {
  writeFileSync(path.join(runDir, `prompt-${name}.md`), prompt);
}

function runClaude(stage, prompt, maxTurns, allowedTools) {
  const result = spawnSync(
    'claude',
    [
      '-p',
      prompt,
      '--allowedTools',
      allowedTools.join(','),
      '--max-turns',
      String(maxTurns),
      '--verbose',
      '--output-format',
      'stream-json',
    ],
    {
      cwd: repoRoot,
      stdio: 'inherit',
    }
  );

  if (result.error && result.error.code === 'ENOENT') {
    fail(
      'Claude Code CLI was not found. Install it with `npm install -g @anthropic-ai/claude-code`.'
    );
  }

  if (result.error) {
    fail(result.error.message);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }

  process.stdout.write(`\n${stage} complete.\n`);
}

function slugify(value) {
  const slug = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);

  return slug || 'architecture';
}

function candidateManifest(scoutReport) {
  const match = scoutReport.match(
    /<!--\s*architecture-refactor-candidates\s*\n([\s\S]*?)\n-->/m
  );

  if (!match) {
    fail('Scout report is missing the hidden candidate manifest.');
  }

  try {
    const manifest = JSON.parse(match[1]);

    if (!Array.isArray(manifest.candidates)) {
      fail('Hidden candidate manifest must include a candidates array.');
    }

    return manifest;
  } catch (error) {
    fail(`Hidden candidate manifest is not valid JSON: ${error.message}`);
  }
}

function candidateTitle(candidateId, scoutReport) {
  const candidate = candidateManifest(scoutReport).candidates.find(
    (item) => item && item.id === candidateId
  );

  if (!candidate) {
    fail(`Candidate not found in hidden candidate manifest: ${candidateId}`);
  }

  if (!candidate.title || typeof candidate.title !== 'string') {
    fail(`Hidden candidate manifest entry is missing a title: ${candidateId}`);
  }

  const title = candidate.title.trim();

  if (!title) {
    fail(`Hidden candidate manifest entry is missing a title: ${candidateId}`);
  }

  return title;
}

function branchExists(branchName) {
  const local = run(
    'git',
    ['rev-parse', '--verify', `refs/heads/${branchName}`],
    { allowFailure: true }
  );

  if (local.status === 0) {
    return true;
  }

  const remote = run(
    'git',
    ['ls-remote', '--exit-code', '--heads', 'origin', branchName],
    {
      allowFailure: true,
    }
  );

  return remote.status === 0;
}

function uniqueBranchName(baseBranchName) {
  if (!branchExists(baseBranchName)) {
    return baseBranchName;
  }

  for (let index = 2; index < 100; index++) {
    const branchName = `${baseBranchName}-${index}`;

    if (!branchExists(branchName)) {
      return branchName;
    }
  }

  fail(`Could not find an available branch name for ${baseBranchName}`);
}

function checkoutImplementationBranch(candidateId, scoutReport) {
  const title = candidateTitle(candidateId, scoutReport);
  const branchName = uniqueBranchName(
    `refactor/${candidateId}-${slugify(title)}`
  );

  run('git', ['switch', '-c', branchName], { stdio: 'inherit' });

  return branchName;
}

function commonValues(runId, runDir, extraValues = {}) {
  return {
    REPO_ROOT: repoRoot,
    RUN_ID: runId,
    RUN_DIR: runDir,
    ...extraValues,
  };
}

function runScout(options) {
  const runId = ensureRunId(options);
  const runDir = ensureRunDirectory(runId);
  const reportPath = path.join(runDir, 'scout.md');
  const prompt = renderTemplate(stageConfig.scout.promptFile, {
    ...commonValues(runId, runDir),
    SCOUT_REPORT_PATH: reportPath,
  });

  writePrompt(runDir, 'scout', prompt);
  runClaude(
    'scout',
    prompt,
    optionNumber(options, 'max-turns', stageConfig.scout.maxTurns),
    stageConfig.scout.allowedTools
  );

  if (!existsSync(reportPath)) {
    fail(`Scout report was not created: ${reportPath}`);
  }

  candidateManifest(readFileSync(reportPath, 'utf8'));

  process.stdout.write(
    `Scout report: ${path.relative(repoRoot, reportPath)}\n`
  );
}

function runImplement(candidateId, options) {
  if (!candidateId) {
    printUsage();
    process.exit(1);
  }

  const runId = ensureRunId(options);
  const runDir = ensureRunDirectory(runId);
  const scoutReportPath = path.join(runDir, 'scout.md');
  const implementationReportPath = path.join(
    runDir,
    `implementation-${candidateId}.md`
  );
  const scoutReport = importReport(options['scout-report'], scoutReportPath);
  const branchName = checkoutImplementationBranch(candidateId, scoutReport);
  const prompt = renderTemplate(stageConfig.implement.promptFile, {
    ...commonValues(runId, runDir),
    CANDIDATE_ID: candidateId,
    BRANCH_NAME: branchName,
    SCOUT_REPORT_PATH: scoutReportPath,
    IMPLEMENTATION_REPORT_PATH: implementationReportPath,
  });

  writePrompt(runDir, `implement-${candidateId}`, prompt);
  runClaude(
    'implement',
    prompt,
    optionNumber(options, 'max-turns', stageConfig.implement.maxTurns),
    stageConfig.implement.allowedTools
  );

  process.stdout.write(
    `Implementation report: ${path.relative(
      repoRoot,
      implementationReportPath
    )}\n`
  );
  process.stdout.write(
    'Changes are intentionally left uncommitted for review.\n'
  );
}

function printCandidateTitle(candidateId, options) {
  if (!candidateId) {
    printUsage();
    process.exit(1);
  }

  if (!options['scout-report'] || options['scout-report'] === true) {
    fail('Missing required option: --scout-report <path>');
  }

  const scoutReportPath = resolveInputPath(options['scout-report']);

  if (!existsSync(scoutReportPath)) {
    fail(`Scout report does not exist: ${scoutReportPath}`);
  }

  process.stdout.write(
    `${candidateTitle(candidateId, readFileSync(scoutReportPath, 'utf8'))}\n`
  );
}

function validateImplementation(options) {
  if (!options.report || options.report === true) {
    fail('Missing required option: --report <path>');
  }

  const reportPath = resolveInputPath(options.report);

  if (!existsSync(reportPath)) {
    fail(`Implementation report was not created: ${reportPath}`);
  }

  const changedFiles = gitChangedFiles();

  process.stdout.write('Changed files selected for the draft PR:\n');

  if (changedFiles.length === 0) {
    process.stdout.write('- <none>\n');
    return;
  }

  for (const file of changedFiles) {
    process.stdout.write(`- ${file}\n`);
  }
}

function main() {
  const { command, options, positionals } = parseArgs(process.argv.slice(2));

  if (!command || command === '--help' || command === 'help') {
    printUsage();
    return;
  }

  if (command === 'resolve-request') {
    resolveRequest();
    return;
  }

  if (command === 'scout') {
    runScout(options);
    return;
  }

  if (command === 'implement') {
    runImplement(positionals[0], options);
    return;
  }

  if (command === 'candidate-title') {
    printCandidateTitle(positionals[0], options);
    return;
  }

  if (command === 'validate-implementation') {
    validateImplementation(options);
    return;
  }

  printUsage();
  process.exit(1);
}

main();
