import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

import json from '@rollup/plugin-json';
import prettier from 'prettier';
import { rollup } from 'rollup';

import {
  createCommonjsPlugin,
  createReplacePlugin,
  createResolvePlugin,
  createTerserPlugin,
} from '../build/rollup.plugins.mjs';

const LIBRARY_BASE_COMMIT = 'f7c7f52aac694f2346c9433e3f43cb8bb18840e3';
const SCHEMA_VERSION = 1;
const HARNESS_DIRECTORY = 'scripts/consumer-bundle-size';
const RESULT_DIRECTORY = `${HARNESS_DIRECTORY}/results/chat`;
const RESULT_PATH = `${RESULT_DIRECTORY}/results.json`;
const REPORT_PATH = `${RESULT_DIRECTORY}/report.md`;
const ENTRY_NAMES = ['js-basic', 'js-chat', 'react-basic', 'react-chat'];
const EXPECTED_PRETTIER_VERSION = '2.8.1';
const GENERATED_FORMAT_OPTIONS = {
  proseWrap: 'never',
  singleQuote: true,
  trailingComma: 'es5',
};
const GENERATED_ESM_MODULE_PATTERN =
  /^packages\/instantsearch\.js\/es\/index\d+\.js$/;
const GENERATED_ESM_REFERENCE_PATTERN = /(?:\.\/|\.\.\/)+index\d+\.js/g;
const GENERATED_ESM_REFERENCE_PLACEHOLDER =
  'bundle-measurement-generated-module';
const EXPECTED_VERSIONS = {
  nodeVersion: '20.19.0',
  yarnVersion: '1.22.22',
  rollupVersion: '4.29.1',
  nodeResolvePluginVersion: '16.0.0',
  commonjsPluginVersion: '28.0.2',
  jsonPluginVersion: '6.1.0',
  replacePluginVersion: '6.0.2',
  terserPluginVersion: '0.4.4',
  terserEngineVersion: '5.46.0',
};
const EXPECTED_FIXTURE_HASHES = {
  'search-client':
    'ea2df869dee913a17767efe4b8a991a66a99faa0ac66774826321764984804b0',
  'js-basic':
    '8566c45f1d5be77a3cd1dee27cc737e708cd41bc3f80046d4f248cbd88e59f10',
  'js-chat': 'de92d9b84beb5a2e7c4d53ed54a5d1abe3e6a6d957d25de444e7a67eb8d615dd',
  'react-basic':
    'd7b257321a8a509a79c5d05cf7e4fa23f7562f7f5c32fc2428a89f4850b643dc',
  'react-chat':
    'c1454b7415e561082b084fc035e90ab2b045f847c8e937d204d9f122b3e956ff',
};
const TOP_LEVEL_RESULT_KEYS = [
  'schemaVersion',
  'resultStatus',
  'libraryBaseCommit',
  'harnessCommit',
  'measurementCommit',
  'measurementTree',
  'candidateCommit',
  'patchHash',
  'repositoryClean',
  'harnessSourceSha256',
  'environment',
  'measurementContract',
  'contractHash',
  'resolvedInputGraphHash',
  'approvedCandidatePaths',
  'candidateChangedPaths',
  'fixtures',
  'runs',
  'comparison',
  'candidates',
];
const ENVIRONMENT_KEYS = [
  'nodeVersion',
  'yarnVersion',
  'rollupVersion',
  'nodeResolvePluginVersion',
  'commonjsPluginVersion',
  'jsonPluginVersion',
  'replacePluginVersion',
  'terserPluginVersion',
  'terserEngineVersion',
  'zlibVersion',
  'platform',
  'architecture',
];
const CONTRACT_KEYS = [
  'entryNames',
  'externalModules',
  'outputFormat',
  'sourceMap',
  'inlineDynamicImports',
  'treeshake',
  'environmentReplacements',
  'pluginOrder',
  'terserOptions',
  'gzipLevel',
  'yarnLockSha256',
];
const RUN_RESULT_KEYS = [
  'entrySha256',
  'resolvedInputGraphSha256',
  'minifiedBytes',
  'gzipBytes',
  'minifiedSha256',
  'gzipSha256',
  'attributionSha256',
];
const ATTRIBUTION_KEYS = [
  'moduleId',
  'transformedSourceSha256',
  'renderedLength',
  'renderedExports',
  'removedExports',
];
const CANDIDATE_INPUT_KEYS = [
  'candidate',
  'retainedModules',
  'necessity',
  'mechanismHypothesis',
  'expectedAffectedFixtures',
  'scopeFit',
  'compatibilityRisk',
  'evidenceStatus',
];
const CANDIDATE_OUTPUT_KEYS = [...CANDIDATE_INPUT_KEYS, 'retainedBytes'];

const scriptPath = fileURLToPath(import.meta.url);
const repositoryRoot = path.resolve(path.dirname(scriptPath), '../..');
const normalizedRepositoryRoot = normalizeSlashes(repositoryRoot);

class HarnessError extends Error {
  constructor(code, message) {
    super(message);
    this.code = code;
  }
}

function fail(code, message) {
  throw new HarnessError(code, message);
}

function normalizeSlashes(value) {
  return value.replaceAll('\\', '/');
}

function sha256(value) {
  return createHash('sha256').update(value).digest('hex');
}

function canonicalize(value) {
  if (Array.isArray(value)) {
    return value.map(canonicalize);
  }

  if (value !== null && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((result, key) => {
        result[key] = canonicalize(value[key]);
        return result;
      }, {});
  }

  return value;
}

function canonicalJson(value) {
  return JSON.stringify(canonicalize(value));
}

function formatGenerated(source, relativePath) {
  return prettier.format(source, {
    ...GENERATED_FORMAT_OPTIONS,
    filepath: path.join(repositoryRoot, relativePath),
  });
}

function prettyJson(value, relativePath) {
  return formatGenerated(`${JSON.stringify(value, null, 2)}\n`, relativePath);
}

function runCommand(command, arguments_, options = {}) {
  try {
    return execFileSync(command, arguments_, {
      cwd: repositoryRoot,
      encoding: options.encoding ?? 'utf8',
      env: {
        ...process.env,
        ...options.env,
      },
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_COMMAND_FAILED',
      'A required local command failed.'
    );
  }
}

function git(arguments_, options) {
  return runCommand('git', arguments_, options);
}

function parseArguments(arguments_) {
  const options = {
    approvedCandidatePaths: [],
    baselineCommit: null,
    candidateFile: null,
    candidatePayload: null,
    gateLane: null,
    harnessCommit: null,
    mode: 'measurement',
    runs: null,
    status: null,
  };

  let index = 0;
  while (index < arguments_.length) {
    const argument = arguments_[index];
    const value = arguments_[index + 1];

    if (
      argument === '--rank-candidates' ||
      argument === '--print-candidate-payload' ||
      argument === '--test-ranking-workflow'
    ) {
      if (options.mode !== 'measurement') {
        fail(
          'BUNDLE_MEASUREMENT_INVALID_ARGUMENT',
          'Only one operation may be selected.'
        );
      }
      options.mode = {
        '--rank-candidates': 'ranking',
        '--print-candidate-payload': 'candidate-payload',
        '--test-ranking-workflow': 'ranking-test',
      }[argument];
      index += 1;
      continue;
    }

    if (argument === '--approved-candidate-path') {
      if (!value) {
        fail(
          'BUNDLE_MEASUREMENT_INVALID_ARGUMENT',
          'A candidate path value is required.'
        );
      }
      options.approvedCandidatePaths.push(normalizePublicPath(value));
      index += 2;
      continue;
    }

    const optionName = {
      '--baseline-commit': 'baselineCommit',
      '--candidate-file': 'candidateFile',
      '--candidate-payload': 'candidatePayload',
      '--gate-lane': 'gateLane',
      '--harness-commit': 'harnessCommit',
      '--runs': 'runs',
      '--status': 'status',
    }[argument];

    if (!optionName || !value) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_ARGUMENT',
        'The measurement arguments are invalid.'
      );
    }

    options[optionName] = value;
    index += 2;
  }

  if (options.mode === 'ranking-test' || options.mode === 'candidate-payload') {
    if (
      arguments_.length !== 1 ||
      options.approvedCandidatePaths.length > 0 ||
      options.baselineCommit !== null ||
      options.candidateFile !== null ||
      options.candidatePayload !== null ||
      options.gateLane !== null ||
      options.harnessCommit !== null ||
      options.runs !== null ||
      options.status !== null
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_ARGUMENT',
        'The selected candidate evidence operation does not accept other arguments.'
      );
    }
    return options;
  }

  if (options.mode === 'ranking') {
    if (
      options.approvedCandidatePaths.length > 0 ||
      options.baselineCommit !== null ||
      options.gateLane !== null ||
      options.harnessCommit !== null ||
      options.runs !== null ||
      options.status !== null ||
      (options.candidateFile === null) === (options.candidatePayload === null)
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_ARGUMENT',
        'Candidate ranking requires exactly one candidate input and no measurement arguments.'
      );
    }

    if (options.candidateFile !== null) {
      options.candidateFile = normalizePublicPath(options.candidateFile);
      if (options.candidateFile !== RESULT_PATH) {
        fail(
          'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT_PATH',
          'Candidate ranking input must use the repository result JSON path.'
        );
      }
    }
    return options;
  }

  if (options.candidateFile !== null || options.candidatePayload !== null) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_ARGUMENT',
      'Candidate inputs are accepted only by the ranking operation.'
    );
  }

  options.runs = Number(options.runs);

  if (!Number.isInteger(options.runs) || options.runs < 1) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RUN_COUNT',
      'The run count must be a positive integer.'
    );
  }

  if (!['provisional', 'verified'].includes(options.status)) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RESULT_STATUS',
      'The result status must be provisional or verified.'
    );
  }

  if (options.status === 'provisional' && options.runs !== 1) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RUN_COUNT',
      'A provisional measurement requires exactly one run.'
    );
  }

  if (options.status === 'verified' && options.runs !== 3) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RUN_COUNT',
      'A verified measurement requires exactly three runs.'
    );
  }

  if ((options.harnessCommit === null) !== (options.baselineCommit === null)) {
    fail(
      'BUNDLE_MEASUREMENT_INCOMPLETE_CANDIDATE_COMMITS',
      'Candidate measurement requires both harness and baseline evidence commits.'
    );
  }

  return options;
}

function normalizePublicPath(value) {
  const normalized = normalizeSlashes(value);
  if (
    normalized.length === 0 ||
    normalized.startsWith('/') ||
    normalized.split('/').includes('..') ||
    /^[A-Za-z]:\//.test(normalized)
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_PUBLIC_PATH',
      'A repository relative public path is required.'
    );
  }
  return normalized.replace(/^\.\//, '');
}

function assertExactKeys(value, expectedKeys, code) {
  const actualKeys = Object.keys(value).sort();
  const sortedExpectedKeys = [...expectedKeys].sort();
  if (canonicalJson(actualKeys) !== canonicalJson(sortedExpectedKeys)) {
    fail(code, 'Generated data does not match the public schema.');
  }
}

function readPackageVersion(packageName) {
  const packagePath = path.join(
    repositoryRoot,
    'node_modules',
    ...packageName.split('/'),
    'package.json'
  );

  try {
    return JSON.parse(readFileSync(packagePath, 'utf8')).version;
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_TOOL_VERSION_UNAVAILABLE',
      'A required tool version is missing.'
    );
  }
}

function collectEnvironment() {
  const environment = {
    nodeVersion: process.versions.node,
    yarnVersion: runCommand('yarn', ['--version'], {
      env: { YARN_IGNORE_PATH: '1' },
    }).trim(),
    rollupVersion: readPackageVersion('rollup'),
    nodeResolvePluginVersion: readPackageVersion('@rollup/plugin-node-resolve'),
    commonjsPluginVersion: readPackageVersion('@rollup/plugin-commonjs'),
    jsonPluginVersion: readPackageVersion('@rollup/plugin-json'),
    replacePluginVersion: readPackageVersion('@rollup/plugin-replace'),
    terserPluginVersion: readPackageVersion('@rollup/plugin-terser'),
    terserEngineVersion: readPackageVersion(
      '@rollup/plugin-terser/node_modules/terser'
    ),
    zlibVersion: process.versions.zlib,
    platform: process.platform,
    architecture: process.arch,
  };

  assertExactKeys(
    environment,
    ENVIRONMENT_KEYS,
    'BUNDLE_MEASUREMENT_ENVIRONMENT_SCHEMA'
  );

  Object.entries(EXPECTED_VERSIONS).forEach(([key, expectedVersion]) => {
    if (environment[key] !== expectedVersion) {
      fail(
        'BUNDLE_MEASUREMENT_TOOL_VERSION_DRIFT',
        'An installed tool version differs from the measurement contract.'
      );
    }
  });

  if (readPackageVersion('prettier') !== EXPECTED_PRETTIER_VERSION) {
    fail(
      'BUNDLE_MEASUREMENT_FORMATTER_VERSION_DRIFT',
      'The generated evidence formatter version differs from the harness.'
    );
  }

  return environment;
}

function listHarnessFiles() {
  const harnessRoot = path.join(repositoryRoot, HARNESS_DIRECTORY);
  const files = [];

  function visit(directory) {
    readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
      const absolutePath = path.join(directory, entry.name);
      const relativePath = normalizeSlashes(
        path.relative(repositoryRoot, absolutePath)
      );

      if (
        relativePath === RESULT_DIRECTORY ||
        relativePath.startsWith(`${RESULT_DIRECTORY}/`)
      ) {
        return;
      }

      if (entry.isSymbolicLink()) {
        fail(
          'BUNDLE_MEASUREMENT_UNSTABLE_HARNESS_PATH',
          'The executable harness cannot contain symbolic links.'
        );
      }

      if (entry.isDirectory()) {
        visit(absolutePath);
        return;
      }

      if (entry.isFile()) {
        files.push(relativePath);
      }
    });
  }

  visit(harnessRoot);
  return files.sort();
}

function hashHarnessSource() {
  const records = listHarnessFiles().map((relativePath) => ({
    path: relativePath,
    sha256: sha256(readFileSync(path.join(repositoryRoot, relativePath))),
  }));
  return sha256(canonicalJson(records));
}

function listChangedPaths() {
  const tracked = git(['diff', '--name-only', 'HEAD', '--'])
    .trim()
    .split('\n')
    .filter(Boolean);
  const untracked = git(['ls-files', '--others', '--exclude-standard'])
    .trim()
    .split('\n')
    .filter(Boolean);

  return [...new Set([...tracked, ...untracked])]
    .map(normalizePublicPath)
    .sort();
}

function assertPathsUnderHarness(paths) {
  const invalidPath = paths.find(
    (relativePath) =>
      relativePath !== HARNESS_DIRECTORY &&
      !relativePath.startsWith(`${HARNESS_DIRECTORY}/`)
  );

  if (invalidPath) {
    fail(
      'BUNDLE_MEASUREMENT_PATH_ISOLATION_FAILED',
      'A changed path is outside the consumer bundle harness.'
    );
  }
}

function assertPathsUnderResults(paths) {
  const invalidPath = paths.find(
    (relativePath) => !relativePath.startsWith(`${RESULT_DIRECTORY}/`)
  );

  if (invalidPath) {
    fail(
      'BUNDLE_MEASUREMENT_BASELINE_EVIDENCE_ISOLATION_FAILED',
      'The baseline evidence commit contains a change outside generated results.'
    );
  }
}

function hashPatch(untrackedPaths) {
  const trackedDiff = git(['diff', '--binary', '--no-ext-diff', 'HEAD', '--']);
  const untrackedHarnessFiles = untrackedPaths
    .filter(
      (relativePath) =>
        relativePath.startsWith(`${HARNESS_DIRECTORY}/`) &&
        !relativePath.startsWith(`${RESULT_DIRECTORY}/`)
    )
    .map((relativePath) => ({
      path: relativePath,
      sha256: sha256(readFileSync(path.join(repositoryRoot, relativePath))),
    }))
    .sort((left, right) => left.path.localeCompare(right.path));

  return sha256(
    canonicalJson({
      trackedDiff,
      untrackedFiles: untrackedHarnessFiles,
    })
  );
}

function inspectRepository(options) {
  const measurementCommit = git(['rev-parse', 'HEAD']).trim();
  const measurementTree = git(['rev-parse', 'HEAD^{tree}']).trim();
  const changedPaths = listChangedPaths();
  const repositoryClean = changedPaths.length === 0;

  git(['cat-file', '-e', `${LIBRARY_BASE_COMMIT}^{commit}`]);
  try {
    execFileSync(
      'git',
      ['merge-base', '--is-ancestor', LIBRARY_BASE_COMMIT, measurementCommit],
      {
        cwd: repositoryRoot,
        stdio: 'ignore',
      }
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_BASE_ANCESTRY_FAILED',
      'The library base is not an ancestor of the measurement commit.'
    );
  }

  const candidateMode = options.harnessCommit !== null;

  if (options.status === 'verified' && !repositoryClean) {
    fail(
      'BUNDLE_MEASUREMENT_DIRTY_VERIFIED_RUN',
      'A verified measurement requires a clean repository.'
    );
  }

  if (!candidateMode) {
    const committedChangedPaths = git([
      'diff',
      '--name-only',
      `${LIBRARY_BASE_COMMIT}..${measurementCommit}`,
    ])
      .trim()
      .split('\n')
      .filter(Boolean)
      .map(normalizePublicPath);

    assertPathsUnderHarness(committedChangedPaths);
    assertPathsUnderHarness(changedPaths);

    if (
      options.status === 'provisional' &&
      measurementCommit !== LIBRARY_BASE_COMMIT
    ) {
      fail(
        'BUNDLE_MEASUREMENT_PROVISIONAL_BASE_DRIFT',
        'The provisional baseline must use the accepted library base commit.'
      );
    }

    return {
      approvedCandidatePaths: [],
      baselineCommit: null,
      candidateChangedPaths: [],
      candidateCommit: null,
      candidateMode: false,
      changedPaths,
      harnessCommit: options.status === 'verified' ? measurementCommit : null,
      measurementCommit,
      measurementTree,
      patchHash: repositoryClean
        ? null
        : hashPatch(
            git(['ls-files', '--others', '--exclude-standard'])
              .trim()
              .split('\n')
              .filter(Boolean)
              .map(normalizePublicPath)
          ),
      repositoryClean,
    };
  }

  if (options.status !== 'verified') {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_STATE',
      'A candidate measurement must be verified.'
    );
  }

  if (!/^[a-f0-9]{40}$/.test(options.harnessCommit)) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_HARNESS_COMMIT',
      'A full harness commit hash is required.'
    );
  }

  if (!/^[a-f0-9]{40}$/.test(options.baselineCommit)) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_BASELINE_COMMIT',
      'A full baseline evidence commit hash is required.'
    );
  }

  const resolvedHarnessCommit = git([
    'rev-parse',
    '--verify',
    `${options.harnessCommit}^{commit}`,
  ]).trim();
  if (resolvedHarnessCommit !== options.harnessCommit) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_HARNESS_COMMIT',
      'The harness commit does not resolve exactly.'
    );
  }

  const resolvedBaselineCommit = git([
    'rev-parse',
    '--verify',
    `${options.baselineCommit}^{commit}`,
  ]).trim();
  if (resolvedBaselineCommit !== options.baselineCommit) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_BASELINE_COMMIT',
      'The baseline evidence commit does not resolve exactly.'
    );
  }

  try {
    execFileSync(
      'git',
      [
        'merge-base',
        '--is-ancestor',
        options.harnessCommit,
        options.baselineCommit,
      ],
      {
        cwd: repositoryRoot,
        stdio: 'ignore',
      }
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_HARNESS_ANCESTRY_FAILED',
      'The harness commit is not an ancestor of the baseline evidence commit.'
    );
  }

  try {
    execFileSync(
      'git',
      [
        'merge-base',
        '--is-ancestor',
        options.baselineCommit,
        measurementCommit,
      ],
      {
        cwd: repositoryRoot,
        stdio: 'ignore',
      }
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_BASELINE_ANCESTRY_FAILED',
      'The baseline evidence commit is not an ancestor of the candidate commit.'
    );
  }

  const baselineChangedPaths = git([
    'diff',
    '--name-only',
    `${options.harnessCommit}..${options.baselineCommit}`,
  ])
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(normalizePublicPath);
  assertPathsUnderResults(baselineChangedPaths);

  if (options.approvedCandidatePaths.length === 0) {
    fail(
      'BUNDLE_MEASUREMENT_MISSING_CANDIDATE_PATHS',
      'A candidate measurement requires approved source and test paths.'
    );
  }

  if (!['shared', 'js', 'react'].includes(options.gateLane)) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_GATE_LANE',
      'A candidate measurement requires a valid gate lane.'
    );
  }

  const candidateChangedPaths = git([
    'diff',
    '--name-only',
    `${options.harnessCommit}..${measurementCommit}`,
  ])
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(normalizePublicPath)
    .sort();

  const invalidCandidatePath = candidateChangedPaths.find(
    (relativePath) =>
      !relativePath.startsWith(`${RESULT_DIRECTORY}/`) &&
      !options.approvedCandidatePaths.some(
        (approvedPath) =>
          relativePath === approvedPath ||
          relativePath.startsWith(`${approvedPath}/`)
      )
  );

  if (invalidCandidatePath) {
    fail(
      'BUNDLE_MEASUREMENT_CANDIDATE_PATH_ISOLATION_FAILED',
      'A candidate change is outside the approved paths.'
    );
  }

  return {
    approvedCandidatePaths: [...options.approvedCandidatePaths].sort(),
    baselineCommit: options.baselineCommit,
    candidateChangedPaths,
    candidateCommit: measurementCommit,
    candidateMode: true,
    changedPaths,
    harnessCommit: options.harnessCommit,
    measurementCommit,
    measurementTree,
    patchHash: null,
    repositoryClean,
  };
}

function buildMeasurementContract() {
  const measurementContract = {
    entryNames: ENTRY_NAMES,
    externalModules: [],
    outputFormat: 'es',
    sourceMap: false,
    inlineDynamicImports: true,
    treeshake: true,
    environmentReplacements: {
      __DEV__: false,
      'process.env.NODE_ENV': 'production',
    },
    pluginOrder: [
      'createResolvePlugin',
      'createCommonjsPlugin',
      'json',
      'createReplacePlugin',
      'createProvenancePlugin',
      'createTerserPlugin',
    ],
    terserOptions: {
      maxWorkers: 1,
      compress: {
        passes: 4,
        toplevel: true,
        pure_getters: true,
      },
      mangle: { toplevel: true },
    },
    gzipLevel: 9,
    yarnLockSha256: sha256(
      readFileSync(path.join(repositoryRoot, 'yarn.lock'))
    ),
  };

  assertExactKeys(
    measurementContract,
    CONTRACT_KEYS,
    'BUNDLE_MEASUREMENT_CONTRACT_SCHEMA'
  );
  return measurementContract;
}

function normalizeCommonjsVirtualId(virtualId) {
  if (/^commonjs(?:Helpers\.js|-dynamic-modules)$/.test(virtualId)) {
    return `virtual/commonjs/${virtualId}`;
  }

  const markerIndex = virtualId.lastIndexOf('?commonjs-');
  if (markerIndex > 0) {
    const underlyingId = virtualId.slice(0, markerIndex);
    const marker = virtualId.slice(markerIndex + 1);
    return `virtual/commonjs/${normalizeNormalModuleId(
      underlyingId
    )}?${marker}`;
  }

  fail(
    'BUNDLE_MEASUREMENT_UNSTABLE_MODULE_ID',
    'A CommonJS virtual module ID cannot be normalized.'
  );
}

function normalizeNormalModuleId(moduleId) {
  const normalized = normalizeSlashes(moduleId);

  if (normalized.startsWith(`${normalizedRepositoryRoot}/`)) {
    return normalizePublicPath(
      normalized.slice(normalizedRepositoryRoot.length + 1)
    );
  }

  if (path.posix.isAbsolute(normalized) || /^[A-Za-z]:\//.test(normalized)) {
    fail(
      'BUNDLE_MEASUREMENT_UNSTABLE_MODULE_ID',
      'A module ID is outside the repository.'
    );
  }

  return normalizePublicPath(normalized);
}

function normalizeModuleId(moduleId) {
  if (moduleId.startsWith('\0')) {
    const virtualId = normalizeSlashes(moduleId.slice(1));
    if (virtualId.startsWith('commonjs')) {
      return normalizeCommonjsVirtualId(virtualId);
    }

    const markerIndex = virtualId.lastIndexOf('?commonjs-');
    if (markerIndex > 0) {
      return normalizeCommonjsVirtualId(virtualId);
    }

    if (!/^[A-Za-z0-9._:@-]+$/.test(virtualId)) {
      fail(
        'BUNDLE_MEASUREMENT_UNSTABLE_MODULE_ID',
        'A virtual module ID does not have a stable label.'
      );
    }

    return `virtual/${virtualId}`;
  }

  return normalizeNormalModuleId(moduleId);
}

function createProvenancePlugin(transformedSources) {
  return {
    name: 'bundle-measurement-provenance',
    transform(code, moduleId) {
      transformedSources.set(moduleId, code);
      return null;
    },
  };
}

function normalizeGeneratedEsmModules(transformedSources) {
  const inputs = [...transformedSources.entries()].map(
    ([moduleId, transformedSource]) => ({
      moduleId,
      normalizedModuleId: normalizeModuleId(moduleId),
      transformedSource,
    })
  );
  const generatedIdentityByModuleId = new Map();
  const generatedModuleIdByIdentity = new Map();

  inputs.forEach(({ normalizedModuleId, transformedSource }) => {
    if (!GENERATED_ESM_MODULE_PATTERN.test(normalizedModuleId)) {
      return;
    }

    const generatedIdentity = sha256(
      transformedSource.replaceAll(
        GENERATED_ESM_REFERENCE_PATTERN,
        GENERATED_ESM_REFERENCE_PLACEHOLDER
      )
    );
    const existingModuleId = generatedModuleIdByIdentity.get(generatedIdentity);
    if (existingModuleId) {
      fail(
        'BUNDLE_MEASUREMENT_GENERATED_MODULE_ID_COLLISION',
        'Two generated ESM modules share one stable content identity.'
      );
    }

    generatedIdentityByModuleId.set(normalizedModuleId, generatedIdentity);
    generatedModuleIdByIdentity.set(generatedIdentity, normalizedModuleId);
  });

  return inputs.map(({ moduleId, normalizedModuleId, transformedSource }) => {
    const stableTransformedSource = normalizedModuleId.startsWith(
      'packages/instantsearch.js/es/'
    )
      ? transformedSource.replaceAll(
          GENERATED_ESM_REFERENCE_PATTERN,
          (reference) => {
            const referencedModuleId = path.posix.normalize(
              path.posix.join(path.posix.dirname(normalizedModuleId), reference)
            );
            const referencedIdentity =
              generatedIdentityByModuleId.get(referencedModuleId);
            if (!referencedIdentity) {
              fail(
                'BUNDLE_MEASUREMENT_UNSTABLE_GENERATED_MODULE_REFERENCE',
                'A generated ESM module reference has no stable content identity.'
              );
            }
            return `${GENERATED_ESM_REFERENCE_PLACEHOLDER}:${referencedIdentity}`;
          }
        )
      : transformedSource;
    const generatedIdentity =
      generatedIdentityByModuleId.get(normalizedModuleId);
    const stableModuleId = generatedIdentity
      ? `${path.posix.dirname(
          normalizedModuleId
        )}/generated/${generatedIdentity}.js`
      : normalizedModuleId;

    return {
      sourceModuleId: moduleId,
      moduleId: stableModuleId,
      transformedSourceSha256: sha256(stableTransformedSource),
    };
  });
}

function normalizeTransformedSources(transformedSources) {
  const normalizedProvenance = normalizeGeneratedEsmModules(transformedSources);
  const normalizedSources = normalizedProvenance.map(
    ({ moduleId, transformedSourceSha256 }) => ({
      moduleId,
      transformedSourceSha256,
    })
  );
  const seenIds = new Set();

  normalizedSources.forEach(({ moduleId }) => {
    if (seenIds.has(moduleId)) {
      fail(
        'BUNDLE_MEASUREMENT_DUPLICATE_MODULE_ID',
        'Two resolved inputs share one normalized module ID.'
      );
    }
    seenIds.add(moduleId);
  });

  return {
    normalizedSources: normalizedSources.sort((left, right) =>
      left.moduleId.localeCompare(right.moduleId)
    ),
    provenanceBySourceModuleId: new Map(
      normalizedProvenance.map((record) => [record.sourceModuleId, record])
    ),
  };
}

function normalizeAttribution(chunk, provenanceBySourceModuleId) {
  const attribution = Object.entries(chunk.modules).map(
    ([moduleId, moduleDetails]) => {
      const provenance = provenanceBySourceModuleId.get(moduleId);
      if (!provenance) {
        fail(
          'BUNDLE_MEASUREMENT_MISSING_TRANSFORMED_SOURCE',
          'A retained module is missing transformed source provenance.'
        );
      }

      const record = {
        moduleId: provenance.moduleId,
        transformedSourceSha256: provenance.transformedSourceSha256,
        renderedLength: moduleDetails.renderedLength,
        renderedExports: [...moduleDetails.renderedExports].sort(),
        removedExports: [...moduleDetails.removedExports].sort(),
      };
      assertExactKeys(
        record,
        ATTRIBUTION_KEYS,
        'BUNDLE_MEASUREMENT_ATTRIBUTION_SCHEMA'
      );
      return record;
    }
  );

  const seenIds = new Set();
  attribution.forEach(({ moduleId }) => {
    if (seenIds.has(moduleId)) {
      fail(
        'BUNDLE_MEASUREMENT_DUPLICATE_MODULE_ID',
        'Two retained inputs share one normalized module ID.'
      );
    }
    seenIds.add(moduleId);
  });

  return attribution.sort(
    (left, right) =>
      right.renderedLength - left.renderedLength ||
      left.moduleId.localeCompare(right.moduleId)
  );
}

function assertPublicEsmGraph(entryName, graph) {
  const moduleIds = new Set(graph.map(({ moduleId }) => moduleId));
  if (
    entryName.startsWith('js-') &&
    !moduleIds.has('packages/instantsearch.js/es/index.js')
  ) {
    fail(
      'BUNDLE_MEASUREMENT_PUBLIC_ESM_RESOLUTION_FAILED',
      `The ${entryName} InstantSearch import did not resolve to the built public ESM entry.`
    );
  }

  if (entryName.startsWith('react-')) {
    [
      'packages/react-instantsearch/dist/es/index.js',
      'packages/react-instantsearch-core/dist/es/index.js',
      'packages/instantsearch-ui-components/dist/es/index.js',
    ].forEach((expectedModuleId) => {
      if (!moduleIds.has(expectedModuleId)) {
        fail(
          'BUNDLE_MEASUREMENT_PUBLIC_ESM_RESOLUTION_FAILED',
          `A ${entryName} React package did not resolve to its built public ESM entry.`
        );
      }
    });
  }
}

async function measureEntry(entryName, measurementContract) {
  const entryPath = path.join(
    repositoryRoot,
    HARNESS_DIRECTORY,
    'fixtures',
    `${entryName}.mjs`
  );
  const entrySource = readFileSync(entryPath);
  const entrySha256 = sha256(entrySource);

  if (entrySha256 !== EXPECTED_FIXTURE_HASHES[entryName]) {
    fail(
      'BUNDLE_MEASUREMENT_FIXTURE_DRIFT',
      'A fixture differs from the accepted source.'
    );
  }

  const transformedSources = new Map();
  let bundle;
  try {
    bundle = await rollup({
      input: entryPath,
      external: [],
      treeshake: true,
      onwarn(warning) {
        if (warning.code === 'UNRESOLVED_IMPORT') {
          fail(
            'BUNDLE_MEASUREMENT_UNRESOLVED_IMPORT',
            'A consumer import could not be resolved.'
          );
        }
      },
      plugins: [
        createResolvePlugin(),
        createCommonjsPlugin(),
        json(),
        createReplacePlugin({ mode: 'production' }),
        createProvenancePlugin(transformedSources),
        createTerserPlugin(measurementContract.terserOptions),
      ],
    });

    const generated = await bundle.generate({
      format: 'es',
      sourcemap: false,
      inlineDynamicImports: true,
    });

    if (generated.output.length !== 1 || generated.output[0].type !== 'chunk') {
      fail(
        'BUNDLE_MEASUREMENT_UNEXPECTED_OUTPUT',
        'A fixture must emit exactly one JavaScript chunk.'
      );
    }

    const chunk = generated.output[0];
    if (chunk.imports.length > 0 || chunk.dynamicImports.length > 0) {
      fail(
        'BUNDLE_MEASUREMENT_UNEXPECTED_EXTERNAL_IMPORT',
        'A generated chunk contains an unexpected import.'
      );
    }

    const { normalizedSources, provenanceBySourceModuleId } =
      normalizeTransformedSources(transformedSources);
    const normalizedGraph = normalizedSources;
    assertPublicEsmGraph(entryName, normalizedGraph);
    const attribution = normalizeAttribution(chunk, provenanceBySourceModuleId);
    const minified = Buffer.from(chunk.code);
    const gzip = gzipSync(minified, { level: measurementContract.gzipLevel });
    const attributionJson = prettyJson(
      attribution,
      `${RESULT_DIRECTORY}/attribution/${entryName}.json`
    );

    return {
      attribution,
      attributionJson,
      gzip,
      minified,
      publicResult: {
        entrySha256,
        resolvedInputGraphSha256: sha256(canonicalJson(normalizedGraph)),
        minifiedBytes: minified.byteLength,
        gzipBytes: gzip.byteLength,
        minifiedSha256: sha256(minified),
        gzipSha256: sha256(gzip),
        attributionSha256: sha256(attributionJson),
      },
    };
  } catch (error) {
    if (error instanceof HarnessError) {
      throw error;
    }
    fail(
      'BUNDLE_MEASUREMENT_BUNDLE_FAILED',
      'A consumer fixture could not be bundled.'
    );
  } finally {
    if (bundle) {
      await bundle.close();
    }
  }
}

function assertRepeatable(reference, current, entryName) {
  const sameMinified = reference.minified.equals(current.minified);
  const sameGzip = reference.gzip.equals(current.gzip);
  const sameAttribution = reference.attributionJson === current.attributionJson;
  const samePublicResult =
    canonicalJson(reference.publicResult) ===
    canonicalJson(current.publicResult);

  if (!sameMinified || !sameGzip || !sameAttribution || !samePublicResult) {
    fail(
      'BUNDLE_MEASUREMENT_NON_DETERMINISTIC_OUTPUT',
      `The ${entryName} output changed between measurement runs.`
    );
  }
}

async function runMeasurements(runCount, measurementContract) {
  const privateRuns = await Array.from({ length: runCount }).reduce(
    (runSequence, _, runIndex) =>
      runSequence.then((completedRuns) =>
        ENTRY_NAMES.reduce(
          (entrySequence, entryName) =>
            entrySequence.then((fixtures) =>
              measureEntry(entryName, measurementContract).then(
                (measurement) => ({
                  ...fixtures,
                  [entryName]: measurement,
                })
              )
            ),
          Promise.resolve({})
        ).then((fixtures) => {
          completedRuns[runIndex] = fixtures;
          return completedRuns;
        })
      ),
    Promise.resolve([])
  );

  if (privateRuns.length > 1) {
    privateRuns.slice(1).forEach((run) => {
      ENTRY_NAMES.forEach((entryName) => {
        assertRepeatable(privateRuns[0][entryName], run[entryName], entryName);
      });
    });
  }

  const publicRuns = privateRuns.map((run, index) => ({
    run: index + 1,
    fixtures: Object.fromEntries(
      ENTRY_NAMES.map((entryName) => {
        const publicResult = run[entryName].publicResult;
        assertExactKeys(
          publicResult,
          RUN_RESULT_KEYS,
          'BUNDLE_MEASUREMENT_RUN_RESULT_SCHEMA'
        );
        return [entryName, publicResult];
      })
    ),
  }));

  return { privateRuns, publicRuns };
}

function buildFixtureRecord() {
  const searchClientPath = `${HARNESS_DIRECTORY}/fixtures/search-client.mjs`;
  const searchClientSha256 = sha256(
    readFileSync(path.join(repositoryRoot, searchClientPath))
  );

  if (searchClientSha256 !== EXPECTED_FIXTURE_HASHES['search-client']) {
    fail(
      'BUNDLE_MEASUREMENT_FIXTURE_DRIFT',
      'The shared search client differs from the accepted source.'
    );
  }

  return {
    label: 'static retention microbenchmarks',
    measurement: 'total loaded graph',
    searchClient: {
      path: searchClientPath,
      sha256: searchClientSha256,
    },
    entries: ENTRY_NAMES.map((entryName) => ({
      name: entryName,
      path: `${HARNESS_DIRECTORY}/fixtures/${entryName}.mjs`,
      flavor: entryName.startsWith('react-') ? 'react' : 'javascript',
      includesChat: entryName.endsWith('-chat'),
    })),
  };
}

function readCommittedBaseline(baselineCommit, harnessCommit) {
  let baselineResults;
  try {
    baselineResults = JSON.parse(
      git(['show', `${baselineCommit}:${RESULT_PATH}`]).trim()
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_BASELINE_RESULTS_MISSING',
      'Verified baseline results are required for a candidate measurement.'
    );
  }

  assertExactKeys(
    baselineResults,
    TOP_LEVEL_RESULT_KEYS,
    'BUNDLE_MEASUREMENT_RESULT_SCHEMA'
  );
  assertVerifiedResultsForRanking(baselineResults);
  if (
    baselineResults.harnessCommit !== harnessCommit ||
    baselineResults.candidates.length !== 3
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_COMMITTED_BASELINE',
      'The committed baseline evidence is incomplete or does not match the harness commit.'
    );
  }

  return baselineResults;
}

function fixtureResultsByName(results) {
  return results.runs[0].fixtures;
}

function computeRetentionComparison(fixtureResults) {
  const comparison = {};
  [
    ['js', 'js-basic', 'js-chat'],
    ['react', 'react-basic', 'react-chat'],
  ].forEach(([flavor, basicName, chatName]) => {
    if (fixtureResults[basicName] && fixtureResults[chatName]) {
      comparison[flavor] = {
        chatMinusBasicMinifiedBytes:
          fixtureResults[chatName].minifiedBytes -
          fixtureResults[basicName].minifiedBytes,
        chatMinusBasicGzipBytes:
          fixtureResults[chatName].gzipBytes -
          fixtureResults[basicName].gzipBytes,
      };
    }
  });
  return comparison;
}

function passesCandidateSizeGate(deltas, gateLane) {
  const basicGate =
    deltas['js-basic'].gzipBytes <= 100 &&
    deltas['react-basic'].gzipBytes <= 100;

  if (gateLane === 'shared') {
    return (
      basicGate &&
      deltas['js-chat'].gzipBytes <= -1000 &&
      deltas['react-chat'].gzipBytes <= -1000
    );
  }

  const affected = `${gateLane}-chat`;
  const other = gateLane === 'js' ? 'react-chat' : 'js-chat';
  return (
    basicGate &&
    deltas[affected].gzipBytes <= -1000 &&
    deltas[other].gzipBytes <= 100
  );
}

function assertCandidateGateRules() {
  const passingShared = {
    'js-basic': { gzipBytes: 100 },
    'js-chat': { gzipBytes: -1000 },
    'react-basic': { gzipBytes: 100 },
    'react-chat': { gzipBytes: -1000 },
  };
  const failingShared = {
    ...passingShared,
    'react-chat': { gzipBytes: -999 },
  };
  const passingJavaScript = {
    ...passingShared,
    'react-chat': { gzipBytes: 100 },
  };
  const passingReact = {
    ...passingShared,
    'js-chat': { gzipBytes: 100 },
  };

  if (
    !passesCandidateSizeGate(passingShared, 'shared') ||
    passesCandidateSizeGate(failingShared, 'shared') ||
    !passesCandidateSizeGate(passingJavaScript, 'js') ||
    !passesCandidateSizeGate(passingReact, 'react')
  ) {
    fail(
      'BUNDLE_MEASUREMENT_GATE_RULE_FAILURE',
      'The candidate size gate rules are inconsistent.'
    );
  }
}

function evaluateCandidateComparison(
  baselineResults,
  fixtureResults,
  gateLane,
  baselineCommit
) {
  if (
    baselineResults.resultStatus !== 'verified' ||
    baselineResults.candidateCommit !== null
  ) {
    fail(
      'BUNDLE_MEASUREMENT_BASELINE_RESULTS_INVALID',
      'Candidate comparison requires verified baseline results.'
    );
  }

  const baselineFixtures = fixtureResultsByName(baselineResults);
  const deltas = Object.fromEntries(
    ENTRY_NAMES.map((entryName) => [
      entryName,
      {
        minifiedBytes:
          fixtureResults[entryName].minifiedBytes -
          baselineFixtures[entryName].minifiedBytes,
        gzipBytes:
          fixtureResults[entryName].gzipBytes -
          baselineFixtures[entryName].gzipBytes,
      },
    ])
  );

  const sizeGatePassed = passesCandidateSizeGate(deltas, gateLane);
  return {
    baselineCommit,
    gateLane,
    deltas,
    sizeGatePassed,
    verdict: sizeGatePassed
      ? gateLane === 'shared'
        ? 'follow-up, compatibility evidence required'
        : 'follow-up, gate confirmation and compatibility evidence required'
      : 'reject',
  };
}

function parseCandidatePayload(candidatePayload) {
  if (
    !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(
      candidatePayload
    )
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'The candidate payload is not valid base64.'
    );
  }

  try {
    return JSON.parse(Buffer.from(candidatePayload, 'base64').toString('utf8'));
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'The candidate payload is not valid JSON.'
    );
  }
}

function readCandidateInputs(options) {
  if (options.candidatePayload !== null) {
    return parseCandidatePayload(options.candidatePayload);
  }

  let candidateDocument;
  try {
    candidateDocument = JSON.parse(
      readFileSync(path.join(repositoryRoot, options.candidateFile), 'utf8')
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'The candidate input is not valid JSON.'
    );
  }

  if (
    candidateDocument === null ||
    Array.isArray(candidateDocument) ||
    typeof candidateDocument !== 'object'
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'Candidate file input must be a generated result JSON object.'
    );
  }
  assertExactKeys(
    candidateDocument,
    TOP_LEVEL_RESULT_KEYS,
    'BUNDLE_MEASUREMENT_RESULT_SCHEMA'
  );
  return candidateDocument.candidates;
}

function rankCandidates(candidateInputs, attributionByFixture) {
  if (!Array.isArray(candidateInputs) || candidateInputs.length !== 3) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'Exactly three ranked candidates are required.'
    );
  }

  const rankedCandidates = candidateInputs.map((candidateRecord) => {
    if (
      candidateRecord === null ||
      Array.isArray(candidateRecord) ||
      typeof candidateRecord !== 'object'
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
        'Every candidate must be an object.'
      );
    }

    const candidateInput = { ...candidateRecord };
    const candidateKeys = Object.keys(candidateInput).sort();
    if (
      canonicalJson(candidateKeys) ===
      canonicalJson([...CANDIDATE_OUTPUT_KEYS].sort())
    ) {
      delete candidateInput.retainedBytes;
    }
    assertExactKeys(
      candidateInput,
      CANDIDATE_INPUT_KEYS,
      'BUNDLE_MEASUREMENT_CANDIDATE_SCHEMA'
    );

    [
      'candidate',
      'necessity',
      'mechanismHypothesis',
      'scopeFit',
      'compatibilityRisk',
      'evidenceStatus',
    ].forEach((field) => {
      if (
        typeof candidateInput[field] !== 'string' ||
        candidateInput[field].trim().length === 0 ||
        /[\n\r|]/.test(candidateInput[field])
      ) {
        fail(
          'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
          'Candidate text fields must be nonempty single line report values.'
        );
      }
    });

    if (
      !Array.isArray(candidateInput.retainedModules) ||
      !Array.isArray(candidateInput.expectedAffectedFixtures)
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
        'Candidate module and fixture fields must be arrays.'
      );
    }

    if (
      candidateInput.retainedModules.length === 0 ||
      new Set(candidateInput.retainedModules).size !==
        candidateInput.retainedModules.length ||
      candidateInput.retainedModules.some(
        (moduleId) => typeof moduleId !== 'string' || moduleId.length === 0
      )
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
        'Candidate retained modules must be unique nonempty module IDs.'
      );
    }

    if (
      candidateInput.expectedAffectedFixtures.length === 0 ||
      new Set(candidateInput.expectedAffectedFixtures).size !==
        candidateInput.expectedAffectedFixtures.length ||
      candidateInput.expectedAffectedFixtures.some(
        (entryName) => !ENTRY_NAMES.includes(entryName)
      )
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
        'Candidate affected fixtures must be unique known entry names.'
      );
    }

    const retainedBytes = Object.fromEntries(
      ENTRY_NAMES.map((entryName) => {
        const modules = new Map(
          attributionByFixture[entryName].map((module) => [
            module.moduleId,
            module.renderedLength,
          ])
        );
        const bytes = candidateInput.retainedModules.reduce(
          (total, moduleId) => total + (modules.get(moduleId) ?? 0),
          0
        );
        return [entryName, bytes];
      })
    );

    if (Object.values(retainedBytes).every((bytes) => bytes === 0)) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
        'A candidate does not match retained module attribution.'
      );
    }

    return {
      ...candidateInput,
      retainedBytes,
    };
  });

  if (
    new Set(rankedCandidates.map(({ candidate }) => candidate)).size !==
    rankedCandidates.length
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'Candidate names must be unique.'
    );
  }

  return rankedCandidates;
}

function encodeCandidatePayload(candidateRecords) {
  if (!Array.isArray(candidateRecords) || candidateRecords.length !== 3) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'Exactly three ranked candidates are required before preserving them.'
    );
  }
  return Buffer.from(JSON.stringify(candidateRecords)).toString('base64');
}

function preserveCandidatePayload(results, attributionByFixture) {
  assertVerifiedResultsForRanking(results);
  if (results.candidates.length !== 3) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'A ranked verified result is required before preserving candidates.'
    );
  }

  const validatedCandidates = rankCandidates(
    results.candidates,
    attributionByFixture
  );
  if (
    canonicalJson(validatedCandidates) !== canonicalJson(results.candidates)
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_CANDIDATE_INPUT',
      'The ranked candidate bytes do not match verified attribution.'
    );
  }
  return encodeCandidatePayload(validatedCandidates);
}

function readResultsDocument() {
  let results;
  try {
    results = JSON.parse(
      readFileSync(path.join(repositoryRoot, RESULT_PATH), 'utf8')
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_RESULTS_MISSING',
      'Generated measurement results are required.'
    );
  }
  assertExactKeys(
    results,
    TOP_LEVEL_RESULT_KEYS,
    'BUNDLE_MEASUREMENT_RESULT_SCHEMA'
  );
  return results;
}

function assertVerifiedResultsForRanking(results) {
  if (
    results.resultStatus !== 'verified' ||
    results.libraryBaseCommit !== LIBRARY_BASE_COMMIT ||
    results.repositoryClean !== true ||
    results.patchHash !== null ||
    results.candidateCommit !== null ||
    results.comparison.candidate !== null ||
    results.harnessCommit !== results.measurementCommit ||
    !/^[a-f0-9]{40}$/.test(results.harnessCommit) ||
    results.runs.length !== 3 ||
    ![0, 3].includes(results.candidates.length)
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RANKING_BASELINE',
      'Candidate ranking requires a verified three run baseline with preserved clean provenance.'
    );
  }

  assertExactKeys(
    results.environment,
    ENVIRONMENT_KEYS,
    'BUNDLE_MEASUREMENT_ENVIRONMENT_SCHEMA'
  );
  assertExactKeys(
    results.measurementContract,
    CONTRACT_KEYS,
    'BUNDLE_MEASUREMENT_CONTRACT_SCHEMA'
  );

  results.runs.forEach((run, index) => {
    assertExactKeys(run, ['run', 'fixtures'], 'BUNDLE_MEASUREMENT_RUN_SCHEMA');
    if (
      run.run !== index + 1 ||
      canonicalJson(Object.keys(run.fixtures).sort()) !==
        canonicalJson([...ENTRY_NAMES].sort())
    ) {
      fail(
        'BUNDLE_MEASUREMENT_INVALID_RANKING_BASELINE',
        'The verified baseline run sequence is invalid.'
      );
    }
    ENTRY_NAMES.forEach((entryName) => {
      assertExactKeys(
        run.fixtures[entryName],
        RUN_RESULT_KEYS,
        'BUNDLE_MEASUREMENT_RUN_RESULT_SCHEMA'
      );
    });
  });

  const referenceFixtures = canonicalJson(results.runs[0].fixtures);
  if (
    results.runs
      .slice(1)
      .some((run) => canonicalJson(run.fixtures) !== referenceFixtures)
  ) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RANKING_BASELINE',
      'The verified baseline runs are not identical.'
    );
  }

  const expectedInputGraphHash = sha256(
    canonicalJson(
      Object.fromEntries(
        ENTRY_NAMES.map((entryName) => [
          entryName,
          results.runs[0].fixtures[entryName].resolvedInputGraphSha256,
        ])
      )
    )
  );
  if (results.resolvedInputGraphHash !== expectedInputGraphHash) {
    fail(
      'BUNDLE_MEASUREMENT_INVALID_RANKING_BASELINE',
      'The verified baseline input graph hash is invalid.'
    );
  }
}

function readAttributionByFixture(results) {
  return Object.fromEntries(
    ENTRY_NAMES.map((entryName) => {
      const relativePath = `${RESULT_DIRECTORY}/attribution/${entryName}.json`;
      let source;
      let attribution;
      try {
        source = readFileSync(path.join(repositoryRoot, relativePath), 'utf8');
        attribution = JSON.parse(source);
      } catch {
        fail(
          'BUNDLE_MEASUREMENT_ATTRIBUTION_MISSING',
          'Verified attribution is required for candidate ranking.'
        );
      }

      if (
        !Array.isArray(attribution) ||
        sha256(source) !==
          results.runs[0].fixtures[entryName].attributionSha256 ||
        prettyJson(attribution, relativePath) !== source
      ) {
        fail(
          'BUNDLE_MEASUREMENT_ATTRIBUTION_DRIFT',
          'Verified attribution differs from the recorded measurement.'
        );
      }

      const seenModuleIds = new Set();
      attribution.forEach((record, index) => {
        assertExactKeys(
          record,
          ATTRIBUTION_KEYS,
          'BUNDLE_MEASUREMENT_ATTRIBUTION_SCHEMA'
        );
        if (
          typeof record.moduleId !== 'string' ||
          record.moduleId.length === 0 ||
          seenModuleIds.has(record.moduleId) ||
          !Number.isInteger(record.renderedLength) ||
          record.renderedLength < 0 ||
          !Array.isArray(record.renderedExports) ||
          !Array.isArray(record.removedExports)
        ) {
          fail(
            'BUNDLE_MEASUREMENT_ATTRIBUTION_DRIFT',
            'Verified attribution contains an invalid module record.'
          );
        }
        seenModuleIds.add(record.moduleId);

        if (index > 0) {
          const previous = attribution[index - 1];
          if (
            previous.renderedLength < record.renderedLength ||
            (previous.renderedLength === record.renderedLength &&
              previous.moduleId.localeCompare(record.moduleId) > 0)
          ) {
            fail(
              'BUNDLE_MEASUREMENT_ATTRIBUTION_DRIFT',
              'Verified attribution is not deterministically sorted.'
            );
          }
        }
      });

      return [entryName, attribution];
    })
  );
}

function measurementEvidenceFingerprint(results) {
  return sha256(canonicalJson({ ...results, candidates: [] }));
}

function rankVerifiedEvidence(
  baselineResults,
  candidateInputs,
  attributionByFixture
) {
  assertVerifiedResultsForRanking(baselineResults);
  const beforeFingerprint = measurementEvidenceFingerprint(baselineResults);
  const rankedResults = {
    ...baselineResults,
    candidates: rankCandidates(candidateInputs, attributionByFixture),
  };

  if (
    measurementEvidenceFingerprint(rankedResults) !== beforeFingerprint ||
    rankedResults.repositoryClean !== true
  ) {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_PROVENANCE_DRIFT',
      'Candidate ranking changed recorded measurement provenance.'
    );
  }

  return rankedResults;
}

function inspectRankingRepository(results) {
  const currentCommit = git(['rev-parse', 'HEAD']).trim();
  const currentChangedPaths = listChangedPaths();
  assertPathsUnderResults(currentChangedPaths);

  try {
    execFileSync(
      'git',
      ['merge-base', '--is-ancestor', results.harnessCommit, currentCommit],
      {
        cwd: repositoryRoot,
        stdio: 'ignore',
      }
    );
  } catch {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_ANCESTRY_FAILED',
      'The verified harness commit is not an ancestor of the ranking commit.'
    );
  }

  const committedChangedPaths = git([
    'diff',
    '--name-only',
    `${results.harnessCommit}..${currentCommit}`,
  ])
    .trim()
    .split('\n')
    .filter(Boolean)
    .map(normalizePublicPath);
  assertPathsUnderResults(committedChangedPaths);

  if (
    git(['rev-parse', `${results.harnessCommit}^{tree}`]).trim() !==
      results.measurementTree ||
    hashHarnessSource() !== results.harnessSourceSha256
  ) {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_HARNESS_DRIFT',
      'The verified harness or measurement tree changed before ranking.'
    );
  }

  const environment = collectEnvironment();
  const measurementContract = buildMeasurementContract();
  const contractHash = sha256(
    canonicalJson({
      environment,
      harnessSourceSha256: results.harnessSourceSha256,
      libraryBaseCommit: LIBRARY_BASE_COMMIT,
      measurementContract,
    })
  );
  if (
    canonicalJson(environment) !== canonicalJson(results.environment) ||
    canonicalJson(measurementContract) !==
      canonicalJson(results.measurementContract) ||
    contractHash !== results.contractHash
  ) {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_CONTRACT_DRIFT',
      'The measurement contract changed before candidate ranking.'
    );
  }
}

function decimalKilobytes(bytes) {
  return (bytes / 1000).toFixed(1);
}

function markdownValue(value) {
  return value === null ? 'Not applicable' : `\`${value}\``;
}

function renderReport(results, attributionByFixture) {
  const firstRun = results.runs[0].fixtures;
  const lines = [
    '# InstantSearch consumer bundle measurement with and without Chat',
    '',
    '## Measurement meaning',
    '',
    'These entries are static retention microbenchmarks. They are not complete or usable applications.',
    '',
    'Each value measures the total loaded graph after tree shaking, minification, and inline dynamic imports. It is not an initial route measurement or an asynchronous chunk measurement.',
    '',
    `Result state: **${results.resultStatus}**.`,
    '',
    '## Contract and provenance',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Library base commit | ${markdownValue(results.libraryBaseCommit)} |`,
    `| Harness commit | ${markdownValue(results.harnessCommit)} |`,
    `| Measurement commit | ${markdownValue(results.measurementCommit)} |`,
    `| Measurement tree | ${markdownValue(results.measurementTree)} |`,
    `| Candidate commit | ${markdownValue(results.candidateCommit)} |`,
    `| Patch hash | ${markdownValue(results.patchHash)} |`,
    `| Repository clean before measurement | \`${results.repositoryClean}\` |`,
    `| Harness source SHA256 | ${markdownValue(results.harnessSourceSha256)} |`,
    `| Contract SHA256 | ${markdownValue(results.contractHash)} |`,
    `| Resolved input graph SHA256 | ${markdownValue(
      results.resolvedInputGraphHash
    )} |`,
    '',
    '### Environment',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Node | \`${results.environment.nodeVersion}\` |`,
    `| Yarn | \`${results.environment.yarnVersion}\` |`,
    `| Rollup | \`${results.environment.rollupVersion}\` |`,
    `| Node Resolve plugin | \`${results.environment.nodeResolvePluginVersion}\` |`,
    `| CommonJS plugin | \`${results.environment.commonjsPluginVersion}\` |`,
    `| JSON plugin | \`${results.environment.jsonPluginVersion}\` |`,
    `| Replace plugin | \`${results.environment.replacePluginVersion}\` |`,
    `| Terser plugin | \`${results.environment.terserPluginVersion}\` |`,
    `| Terser engine | \`${results.environment.terserEngineVersion}\` |`,
    `| zlib | \`${results.environment.zlibVersion}\` |`,
    `| Platform | \`${results.environment.platform}\` |`,
    `| Architecture | \`${results.environment.architecture}\` |`,
    '',
    `Evidence formatter: Prettier \`${EXPECTED_PRETTIER_VERSION}\`. This report metadata does not add a field to the accepted environment schema.`,
    '',
    '### Measurement contract',
    '',
    '| Field | Value |',
    '| --- | --- |',
    `| Entry names | \`${JSON.stringify(
      results.measurementContract.entryNames
    )}\` |`,
    `| External modules | \`${JSON.stringify(
      results.measurementContract.externalModules
    )}\` |`,
    `| Output format | \`${results.measurementContract.outputFormat}\` |`,
    `| Source map | \`${results.measurementContract.sourceMap}\` |`,
    `| Inline dynamic imports | \`${results.measurementContract.inlineDynamicImports}\` |`,
    `| Tree shaking | \`${results.measurementContract.treeshake}\` |`,
    `| Environment replacements | \`${JSON.stringify(
      results.measurementContract.environmentReplacements
    )}\` |`,
    `| Plugin order | \`${JSON.stringify(
      results.measurementContract.pluginOrder
    )}\` |`,
    `| Terser options | \`${JSON.stringify(
      results.measurementContract.terserOptions
    )}\` |`,
    `| Gzip level | \`${results.measurementContract.gzipLevel}\` |`,
    `| yarn.lock SHA256 | \`${results.measurementContract.yarnLockSha256}\` |`,
    '',
    'External modules: `[]`. React and React DOM remain bundled in React entries. The JavaScript entries retain React only when their graph reaches it.',
    '',
    '## Verified baseline',
    '',
  ];

  if (results.resultStatus === 'verified' && results.candidateCommit === null) {
    lines.push(
      '| Entry | State | Minified bytes | Minified kB | Gzip bytes | Gzip kB |',
      '| --- | --- | ---: | ---: | ---: | ---: |'
    );
    ENTRY_NAMES.forEach((entryName) => {
      const fixture = firstRun[entryName];
      lines.push(
        `| \`${entryName}\` | verified | ${
          fixture.minifiedBytes
        } | ${decimalKilobytes(fixture.minifiedBytes)} | ${
          fixture.gzipBytes
        } | ${decimalKilobytes(fixture.gzipBytes)} |`
      );
    });
  } else {
    lines.push(
      'No verified baseline is recorded in this report. Provisional values below must not be used as the clean baseline.'
    );
  }

  lines.push('', '## Provisional impact', '');
  if (results.resultStatus === 'provisional') {
    lines.push(
      '| Entry | State | Minified bytes | Minified kB | Gzip bytes | Gzip kB |',
      '| --- | --- | ---: | ---: | ---: | ---: |'
    );
    ENTRY_NAMES.forEach((entryName) => {
      const fixture = firstRun[entryName];
      lines.push(
        `| \`${entryName}\` | provisional | ${
          fixture.minifiedBytes
        } | ${decimalKilobytes(fixture.minifiedBytes)} | ${
          fixture.gzipBytes
        } | ${decimalKilobytes(fixture.gzipBytes)} |`
      );
    });
  } else {
    lines.push('No provisional values are presented as verified results.');
  }

  lines.push(
    '',
    '## Fixture and output hashes',
    '',
    `Shared search client SHA256: \`${results.fixtures.searchClient.sha256}\`.`,
    '',
    '| Entry | State | Entry SHA256 | Input graph SHA256 | Minified SHA256 | Gzip SHA256 | Attribution SHA256 |',
    '| --- | --- | --- | --- | --- | --- | --- |'
  );
  ENTRY_NAMES.forEach((entryName) => {
    const fixture = firstRun[entryName];
    lines.push(
      `| \`${entryName}\` | ${results.resultStatus} | \`${fixture.entrySha256}\` | \`${fixture.resolvedInputGraphSha256}\` | \`${fixture.minifiedSha256}\` | \`${fixture.gzipSha256}\` | \`${fixture.attributionSha256}\` |`
    );
  });

  lines.push(
    '',
    '## Retention comparison',
    '',
    '| Flavor | State | Chat minus basic minified bytes | Chat minus basic gzip bytes |',
    '| --- | --- | ---: | ---: |'
  );
  Object.entries(results.comparison.retention).forEach(
    ([flavor, comparison]) => {
      lines.push(
        `| ${flavor} | ${results.resultStatus} | ${comparison.chatMinusBasicMinifiedBytes} | ${comparison.chatMinusBasicGzipBytes} |`
      );
    }
  );

  lines.push(
    '',
    '## Retained module attribution',
    '',
    '`renderedLength` is Rollup rendered source length. It is not minified bytes or gzip bytes.',
    ''
  );
  ENTRY_NAMES.forEach((entryName) => {
    lines.push(
      `### ${entryName}`,
      '',
      '| Module | Rendered length |',
      '| --- | ---: |'
    );
    attributionByFixture[entryName].slice(0, 10).forEach((module) => {
      lines.push(`| \`${module.moduleId}\` | ${module.renderedLength} |`);
    });

    const retainedReact = attributionByFixture[entryName]
      .filter(
        ({ moduleId }) =>
          moduleId.startsWith('node_modules/react/') ||
          moduleId.startsWith('node_modules/react-dom/')
      )
      .map(({ moduleId }) => moduleId);
    const retainedChat = attributionByFixture[entryName]
      .filter(
        ({ moduleId }) =>
          moduleId.toLowerCase().includes('/chat') ||
          moduleId.includes('/ai-lite/')
      )
      .map(({ moduleId }) => moduleId);

    lines.push(
      '',
      `React modules retained: ${
        retainedReact.length === 0
          ? 'none'
          : retainedReact.map((moduleId) => `\`${moduleId}\``).join(', ')
      }.`,
      '',
      `Chat or ai-lite modules retained: ${
        retainedChat.length === 0
          ? 'none'
          : retainedChat.map((moduleId) => `\`${moduleId}\``).join(', ')
      }.`,
      ''
    );

    if (
      entryName.endsWith('-basic') &&
      retainedChat.includes('packages/instantsearch.js/es/lib/chat/openChat.js')
    ) {
      lines.push(
        'The basic SearchBox path retains the shared Chat opening helper because the built SearchBox imports it.',
        ''
      );
    }

    if (
      entryName === 'js-chat' &&
      retainedReact.length > 0 &&
      attributionByFixture[entryName].some(({ moduleId }) =>
        moduleId.includes('markdown-to-jsx')
      )
    ) {
      lines.push(
        'The JavaScript Chat graph retains React because its reached Markdown renderer has a static React import.',
        ''
      );
    }
  });

  lines.push(
    '## Repeatability boundary',
    '',
    'The three verified consumer runs share one clean `YARN_IGNORE_PATH=1 yarn build:ci` output. They require identical minified output, gzip output, hashes, resolved input graphs, and normalized attribution.',
    '',
    'Only output from a build that satisfies all five absence preconditions can supply a provisional or verified measurement. This generated evidence does not claim repeatability across independent package builds.',
    '',
    '## Evidence lifecycle',
    '',
    '1. The harness commit freezes the reviewed harness and provisional artifacts.',
    '2. Verified baseline measurement starts clean at the harness commit. The three run measurement records `repositoryClean: true`, writes verified attribution, and leaves `candidates: []`.',
    '3. The ranking only operation runs after attribution exists. It permits only generated result changes, adds exactly three candidates, and preserves every recorded measurement and clean state field.',
    '4. The user reviews and commits the ranked verified artifacts separately. That commit is the baseline evidence commit.',
    '5. A later candidate measurement supplies both the original harness commit and the baseline evidence commit, then loads the verified baseline and ranked candidates from Git.',
    '',
    '### Verified baseline Git states',
    '',
    '1. Before measurement: `HEAD` equals the harness commit and `git status --short` has no output.',
    `2. After measurement: the worktree is dirty only under \`${RESULT_DIRECTORY}/\`. The recorded \`repositoryClean: true\` remains the state captured before measurement.`,
    `3. Before ranking: the worktree is still dirty only under \`${RESULT_DIRECTORY}/\`. Ranking rejects changes anywhere else.`,
    `4. After ranking: only \`${RESULT_PATH}\` and \`${REPORT_PATH}\` are rewritten by ranking. Measurement provenance and attribution files are unchanged.`,
    '5. After the user commits verified evidence: `git status --short` has no output and `HEAD` is the baseline evidence commit.',
    '',
    '## Ranked candidates',
    ''
  );
  if (results.candidates.length === 0) {
    lines.push(
      'Candidate ranking waits for the verified baseline and complete attribution.'
    );
  } else {
    lines.push(
      '| Rank | Candidate | Retained bytes | Necessity | Mechanism hypothesis | Expected fixtures | Scope fit | Compatibility risk | Evidence status |',
      '| ---: | --- | --- | --- | --- | --- | --- | --- | --- |'
    );
    results.candidates.forEach((candidate, index) => {
      const retainedBytes = Object.entries(candidate.retainedBytes)
        .map(([entryName, bytes]) => `${entryName}: ${bytes}`)
        .join(', ');
      lines.push(
        `| ${index + 1} | ${candidate.candidate} | ${retainedBytes} | ${
          candidate.necessity
        } | ${
          candidate.mechanismHypothesis
        } | ${candidate.expectedAffectedFixtures.join(', ')} | ${
          candidate.scopeFit
        } | ${candidate.compatibilityRisk} | ${candidate.evidenceStatus} |`
      );
    });
  }

  lines.push('', '## Candidate experiment', '');
  if (results.comparison.candidate === null) {
    lines.push(
      'No production candidate is measured or selected in this report.'
    );
  } else {
    lines.push(
      `Gate lane: \`${results.comparison.candidate.gateLane}\`.`,
      '',
      `Size gate passed: \`${results.comparison.candidate.sizeGatePassed}\`.`,
      '',
      `Verdict: **${results.comparison.candidate.verdict}**.`
    );
  }

  const measurementArguments = [
    `--runs ${results.resultStatus === 'verified' ? '3' : '1'}`,
    `--status ${results.resultStatus}`,
  ];
  const preserveRankedCandidates =
    results.resultStatus === 'verified' &&
    results.candidateCommit === null &&
    results.candidates.length === 3;
  if (results.candidateCommit !== null) {
    measurementArguments.push(
      `--harness-commit ${results.harnessCommit}`,
      `--baseline-commit ${results.comparison.candidate.baselineCommit}`,
      `--gate-lane ${results.comparison.candidate.gateLane}`,
      ...results.approvedCandidatePaths.map(
        (approvedPath) => `--approved-candidate-path ${approvedPath}`
      )
    );
  }

  lines.push(
    '',
    '## Reproduction',
    '',
    '```sh',
    'fnm use 20.19.0',
    'test "$(node --version)" = "v20.19.0"',
    'test "$(YARN_IGNORE_PATH=1 yarn --version)" = "1.22.22"',
    ...(preserveRankedCandidates
      ? [
          `candidate_payload="$(node ${HARNESS_DIRECTORY}/measure.mjs --print-candidate-payload)"`,
        ]
      : []),
    'YARN_IGNORE_PATH=1 yarn install --frozen-lockfile',
    'test ! -e packages/instantsearch.js/es',
    'test ! -e packages/react-instantsearch/dist',
    'test ! -e packages/react-instantsearch-core/dist',
    'test ! -e packages/instantsearch-ui-components/dist',
    'test ! -e packages/algoliasearch-helper/dist',
    'YARN_IGNORE_PATH=1 yarn build:ci',
    `node ${HARNESS_DIRECTORY}/measure.mjs ${measurementArguments.join(' ')}`,
    ...(preserveRankedCandidates
      ? [
          `node ${HARNESS_DIRECTORY}/measure.mjs --rank-candidates --candidate-payload "$candidate_payload"`,
        ]
      : []),
    '```',
    ''
  );

  if (results.candidateCommit === null) {
    lines.push(
      '## Candidate ranking reproduction',
      '',
      'The clean verified measurement command always writes `candidates: []`. Candidate selection happens afterward and does not rerun measurement.',
      ''
    );
    if (results.candidates.length === 3) {
      lines.push(
        'The complete reproduction block preserves the ranked records before measurement resets `results.json`, then restores them through the validated payload. For a ranking only replay that does not rerun measurement, the current result file remains valid input:',
        '',
        '```sh',
        `node ${HARNESS_DIRECTORY}/measure.mjs --rank-candidates --candidate-file ${RESULT_PATH}`,
        '```',
        ''
      );
    } else {
      lines.push(
        'After attribution review, provide the three selected candidate records as JSON encoded with base64:',
        '',
        '```sh',
        `node ${HARNESS_DIRECTORY}/measure.mjs --rank-candidates --candidate-payload <base64-candidate-array>`,
        '```',
        ''
      );
    }
  }

  lines.push(
    'Focused ranking lifecycle test:',
    '',
    '```sh',
    `node ${HARNESS_DIRECTORY}/measure.mjs --test-ranking-workflow`,
    '```',
    ''
  );

  return lines.join('\n');
}

function assertPublicationSafe(outputs) {
  const unsafeTerms = [
    '/Users/',
    '/private/',
    '/tmp/',
    'ai-context',
    'tracker',
    'transcript',
    'knowledge/meetings',
  ];

  outputs.forEach((output) => {
    const lowerCaseOutput = output.toLowerCase();
    if (
      unsafeTerms.some((term) =>
        lowerCaseOutput.includes(term.toLowerCase())
      ) ||
      /[A-Za-z]:\\/.test(output)
    ) {
      fail(
        'BUNDLE_MEASUREMENT_PUBLICATION_SAFETY_FAILED',
        'Generated evidence contains a private or unstable reference.'
      );
    }
  });
}

function writeOutputs(results, attributionByFixture) {
  assertExactKeys(
    results,
    TOP_LEVEL_RESULT_KEYS,
    'BUNDLE_MEASUREMENT_RESULT_SCHEMA'
  );
  const resultJson = prettyJson(results, RESULT_PATH);
  const report = formatGenerated(
    renderReport(results, attributionByFixture),
    REPORT_PATH
  );
  const attributionOutputs = ENTRY_NAMES.map((entryName) => ({
    path: `${RESULT_DIRECTORY}/attribution/${entryName}.json`,
    source: prettyJson(
      attributionByFixture[entryName],
      `${RESULT_DIRECTORY}/attribution/${entryName}.json`
    ),
  }));

  assertPublicationSafe([
    resultJson,
    report,
    ...attributionOutputs.map(({ source }) => source),
  ]);

  mkdirSync(path.join(repositoryRoot, RESULT_DIRECTORY, 'attribution'), {
    recursive: true,
  });
  attributionOutputs.forEach((output) => {
    writeFileSync(path.join(repositoryRoot, output.path), output.source);
  });
  writeFileSync(path.join(repositoryRoot, RESULT_PATH), resultJson);
  writeFileSync(path.join(repositoryRoot, REPORT_PATH), report);
}

function writeRankedOutputs(results, attributionByFixture) {
  assertExactKeys(
    results,
    TOP_LEVEL_RESULT_KEYS,
    'BUNDLE_MEASUREMENT_RESULT_SCHEMA'
  );
  const resultJson = prettyJson(results, RESULT_PATH);
  const report = formatGenerated(
    renderReport(results, attributionByFixture),
    REPORT_PATH
  );
  assertPublicationSafe([
    resultJson,
    report,
    ...ENTRY_NAMES.map((entryName) =>
      prettyJson(
        attributionByFixture[entryName],
        `${RESULT_DIRECTORY}/attribution/${entryName}.json`
      )
    ),
  ]);
  writeFileSync(path.join(repositoryRoot, RESULT_PATH), resultJson);
  writeFileSync(path.join(repositoryRoot, REPORT_PATH), report);
}

function buildRankingWorkflowCandidates(attributionByFixture) {
  const retainedModules = [
    ...new Set(
      ENTRY_NAMES.flatMap((entryName) =>
        attributionByFixture[entryName]
          .filter(({ renderedLength }) => renderedLength > 0)
          .map(({ moduleId }) => moduleId)
      )
    ),
  ].slice(0, 3);

  if (retainedModules.length !== 3) {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_TEST_FAILED',
      'The ranking workflow test needs three retained modules.'
    );
  }

  return retainedModules.map((moduleId, index) => ({
    candidate: `ranking workflow candidate ${index + 1}`,
    retainedModules: [moduleId],
    necessity: 'test necessity',
    mechanismHypothesis: 'test whole module removal',
    expectedAffectedFixtures: ENTRY_NAMES.filter((entryName) =>
      attributionByFixture[entryName].some(
        (record) => record.moduleId === moduleId
      )
    ),
    scopeFit: 'test scope fit',
    compatibilityRisk: 'test compatibility risk',
    evidenceStatus: 'test attribution evidence',
  }));
}

function runRankingWorkflowTest() {
  collectEnvironment();
  const currentResults = readResultsDocument();
  const attributionByFixture = readAttributionByFixture(currentResults);
  const verifiedBaseline = structuredClone(currentResults);
  verifiedBaseline.resultStatus = 'verified';
  verifiedBaseline.harnessCommit = verifiedBaseline.measurementCommit;
  verifiedBaseline.patchHash = null;
  verifiedBaseline.repositoryClean = true;
  verifiedBaseline.runs = Array.from({ length: 3 }, (_, index) => ({
    run: index + 1,
    fixtures: structuredClone(currentResults.runs[0].fixtures),
  }));
  verifiedBaseline.candidates = [];

  const baselineFingerprint = measurementEvidenceFingerprint(verifiedBaseline);
  const candidatePayload = Buffer.from(
    canonicalJson(buildRankingWorkflowCandidates(attributionByFixture))
  ).toString('base64');
  const rankingOptions = parseArguments([
    '--rank-candidates',
    '--candidate-payload',
    candidatePayload,
  ]);
  const rankedResults = rankVerifiedEvidence(
    verifiedBaseline,
    readCandidateInputs(rankingOptions),
    attributionByFixture
  );
  const resultJson = prettyJson(rankedResults, RESULT_PATH);
  const report = formatGenerated(
    renderReport(rankedResults, attributionByFixture),
    REPORT_PATH
  );
  const parsedResult = JSON.parse(resultJson);

  if (
    verifiedBaseline.candidates.length !== 0 ||
    parsedResult.candidates.length !== 3 ||
    parsedResult.repositoryClean !== true ||
    parsedResult.runs.length !== 3 ||
    measurementEvidenceFingerprint(parsedResult) !== baselineFingerprint
  ) {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_TEST_FAILED',
      'The empty to ranked candidate transition changed measurement evidence.'
    );
  }

  const preservedCandidatePayload = preserveCandidatePayload(
    parsedResult,
    attributionByFixture
  );
  const resetResults = {
    ...parsedResult,
    candidates: [],
  };
  const resetResultJson = prettyJson(resetResults, RESULT_PATH);
  const rerankingOptions = parseArguments([
    '--rank-candidates',
    '--candidate-payload',
    preservedCandidatePayload,
  ]);
  const repeatedResults = rankVerifiedEvidence(
    JSON.parse(resetResultJson),
    readCandidateInputs(rerankingOptions),
    attributionByFixture
  );
  const preserveCommandIndex = report.indexOf('--print-candidate-payload');
  const measurementCommandIndex = report.indexOf('--runs 3 --status verified');
  const rerankingCommandIndex = report.indexOf(
    '--rank-candidates --candidate-payload "$candidate_payload"'
  );
  if (
    JSON.parse(resetResultJson).candidates.length !== 0 ||
    prettyJson(repeatedResults, RESULT_PATH) !== resultJson ||
    formatGenerated(
      renderReport(repeatedResults, attributionByFixture),
      REPORT_PATH
    ) !== report ||
    preserveCommandIndex < 0 ||
    measurementCommandIndex <= preserveCommandIndex ||
    rerankingCommandIndex <= measurementCommandIndex
  ) {
    fail(
      'BUNDLE_MEASUREMENT_RANKING_TEST_FAILED',
      'The preserved candidate payload does not reproduce ranked evidence after measurement reset.'
    );
  }

  assertPublicationSafe([resultJson, report]);
  process.stdout.write(
    'ranking workflow: ranked candidates preserved, reset, and restored byte identically\n'
  );
}

function runCandidatePayloadExport() {
  collectEnvironment();
  const results = readResultsDocument();
  const attributionByFixture = readAttributionByFixture(results);
  process.stdout.write(
    `${preserveCandidatePayload(results, attributionByFixture)}\n`
  );
}

function runCandidateRanking(options) {
  const baselineResults = readResultsDocument();
  assertVerifiedResultsForRanking(baselineResults);
  inspectRankingRepository(baselineResults);
  const attributionByFixture = readAttributionByFixture(baselineResults);
  const rankedResults = rankVerifiedEvidence(
    baselineResults,
    readCandidateInputs(options),
    attributionByFixture
  );
  writeRankedOutputs(rankedResults, attributionByFixture);
  process.stdout.write(
    'ranked: 3 candidates, measurement provenance preserved\n'
  );
}

async function runMeasurement(options) {
  const environment = collectEnvironment();
  const repository = inspectRepository(options);
  const harnessSourceSha256 = hashHarnessSource();
  const measurementContract = buildMeasurementContract();
  const contractHash = sha256(
    canonicalJson({
      environment,
      harnessSourceSha256,
      libraryBaseCommit: LIBRARY_BASE_COMMIT,
      measurementContract,
    })
  );

  let baselineResults = null;
  if (repository.candidateMode) {
    baselineResults = readCommittedBaseline(
      repository.baselineCommit,
      repository.harnessCommit
    );
    if (
      baselineResults.harnessSourceSha256 !== harnessSourceSha256 ||
      baselineResults.contractHash !== contractHash
    ) {
      fail(
        'BUNDLE_MEASUREMENT_CANDIDATE_CONTRACT_DRIFT',
        'The executable harness or measurement contract changed.'
      );
    }
  }

  const { privateRuns, publicRuns } = await runMeasurements(
    options.runs,
    measurementContract
  );
  const firstRun = privateRuns[0];
  const attributionByFixture = Object.fromEntries(
    ENTRY_NAMES.map((entryName) => [entryName, firstRun[entryName].attribution])
  );
  const publicFixtureResults = publicRuns[0].fixtures;
  const resolvedInputGraphHash = sha256(
    canonicalJson(
      Object.fromEntries(
        ENTRY_NAMES.map((entryName) => [
          entryName,
          publicFixtureResults[entryName].resolvedInputGraphSha256,
        ])
      )
    )
  );
  const candidates = repository.candidateMode ? baselineResults.candidates : [];
  const comparison = {
    retention: computeRetentionComparison(publicFixtureResults),
    candidate: repository.candidateMode
      ? evaluateCandidateComparison(
          baselineResults,
          publicFixtureResults,
          options.gateLane,
          repository.baselineCommit
        )
      : null,
  };

  const results = {
    schemaVersion: SCHEMA_VERSION,
    resultStatus: options.status,
    libraryBaseCommit: LIBRARY_BASE_COMMIT,
    harnessCommit: repository.harnessCommit,
    measurementCommit: repository.measurementCommit,
    measurementTree: repository.measurementTree,
    candidateCommit: repository.candidateCommit,
    patchHash: repository.patchHash,
    repositoryClean: repository.repositoryClean,
    harnessSourceSha256,
    environment,
    measurementContract,
    contractHash,
    resolvedInputGraphHash,
    approvedCandidatePaths: repository.approvedCandidatePaths,
    candidateChangedPaths: repository.candidateChangedPaths,
    fixtures: buildFixtureRecord(),
    runs: publicRuns,
    comparison,
    candidates,
  };

  writeOutputs(results, attributionByFixture);
  process.stdout.write(
    `${options.status}: ${ENTRY_NAMES.length} entries, ${options.runs} run${
      options.runs === 1 ? '' : 's'
    }\n`
  );
}

async function main() {
  const options = parseArguments(process.argv.slice(2));
  assertCandidateGateRules();

  if (options.mode === 'ranking-test') {
    runRankingWorkflowTest();
    return;
  }

  if (options.mode === 'candidate-payload') {
    runCandidatePayloadExport();
    return;
  }

  if (options.mode === 'ranking') {
    runCandidateRanking(options);
    return;
  }

  await runMeasurement(options);
}

main().catch((error) => {
  if (error instanceof HarnessError) {
    process.stderr.write(`${error.code}: ${error.message}\n`);
  } else {
    process.stderr.write(
      'BUNDLE_MEASUREMENT_UNEXPECTED_FAILURE: The consumer bundle measurement failed.\n'
    );
  }
  process.exitCode = 1;
});
