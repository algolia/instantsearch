import fs from 'fs';
import path from 'path';

import { nextCacheComponentsEnabled } from './agents-md';
import {
  publicEnvPrefix,
  readProjectCredentials,
  writePublicEnv,
} from './credentials';
import { detect } from './detector';
import { failureEnvelope, formatEnvelope, successEnvelope } from './envelope';
import { writeManifest, type Manifest } from './manifest';
import { npxCommand } from './program-name';

import type { IO } from './io';

type PackageManager = 'yarn' | 'npm' | 'pnpm' | 'bun';

type PromptQuestion = {
  type: 'text' | 'password' | 'confirm';
  name: string;
  message: string;
  initial?: string | boolean;
};

type PromptAnswers = {
  appId?: string;
  searchApiKey?: string;
  componentsPath?: string;
  libPath?: string;
  installConfirmed?: boolean;
};

export type PromptFn = (questions: PromptQuestion[]) => Promise<PromptAnswers>;

export type Installer = (
  packages: string[],
  context: { cwd: string; manager: PackageManager }
) => Promise<void>;

export type InitOptions = {
  cwd: string;
  json: boolean;
  yes: boolean;
  componentsPath?: string;
  libPath?: string;
  appId?: string;
  searchApiKey?: string;
  framework?: 'next-app';
  prompt?: PromptFn;
  installer?: Installer;
  /** Process environment to read credentials from (defaults to process.env). */
  env?: Record<string, string | undefined>;
};

const COMMAND = 'init';
const MANIFEST_FILENAME = 'instantsearch.json';

// A folder with none of these, and no UI dependency, has no app to add search to.
const APP_MARKERS = [
  'src',
  'app',
  'pages',
  'components',
  'index.html',
  'public',
];
const UI_DEPENDENCIES = [
  'react',
  'next',
  'vue',
  'nuxt',
  'svelte',
  '@sveltejs/kit',
  '@angular/core',
  'preact',
  'solid-js',
  'astro',
  'vite',
  'instantsearch.js',
];

export async function runInit(
  rawOptions: InitOptions,
  io: IO
): Promise<number> {
  const options: InitOptions = {
    ...rawOptions,
    yes: rawOptions.yes || rawOptions.json,
  };

  const manifestPath = path.join(options.cwd, MANIFEST_FILENAME);
  if (fs.existsSync(manifestPath)) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'manifest_exists',
        `A manifest already exists at ${manifestPath}. Edit it directly to update settings.`
      )
    );
    return 1;
  }

  const detection = detect(options.cwd, {
    command: COMMAND,
    frameworkOverride: options.framework,
  });
  if (!detection.ok) {
    const noApp =
      (detection.code === 'package_json_not_found' ||
        detection.code === 'unsupported_flavor') &&
      looksLikeEmptyProject(options.cwd);
    emitFailure(io, options.json, noApp ? noAppEnvelope(options) : detection);
    return 1;
  }

  const credentialsResult = await resolveInputs(options, io);
  if (!credentialsResult.ok) return 1;

  const {
    appId,
    searchApiKey,
    indexName,
    componentsPath,
    libPath,
    credentialsSource,
  } = credentialsResult.value;

  if (!isSafeRelativePath(componentsPath)) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'invalid_components_path',
        `--components-path must be a relative path inside the project (got "${componentsPath}").`
      )
    );
    return 1;
  }
  if (!isSafeRelativePath(libPath)) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'invalid_lib_path',
        `--lib-path must be a relative path inside the project (got "${libPath}").`
      )
    );
    return 1;
  }

  const packages = ['algoliasearch', 'react-instantsearch'];
  if (detection.framework === 'next-app') {
    packages.push('react-instantsearch-nextjs');
  }

  const missing = findMissingPackages(options.cwd, packages);
  if (missing.length > 0) {
    if (!options.yes) {
      const promptFn = options.prompt ?? defaultPrompt;
      const answers = await promptFn([
        {
          type: 'confirm',
          name: 'installConfirmed',
          message: `Install missing packages: ${missing.join(', ')}?`,
          initial: true,
        },
      ]);
      if (!('installConfirmed' in answers)) {
        emitFailure(
          io,
          options.json,
          failureEnvelope(COMMAND, 'cancelled', 'Cancelled by user.')
        );
        return 1;
      }
      if (!answers.installConfirmed) {
        emitFailure(
          io,
          options.json,
          failureEnvelope(
            COMMAND,
            'install_declined',
            `Cannot proceed without installing: ${missing.join(', ')}.`
          )
        );
        return 1;
      }
    }

    const installer = options.installer ?? defaultInstaller;
    const manager = detectPackageManager(options.cwd);
    try {
      await installer(missing, { cwd: options.cwd, manager });
    } catch (error) {
      emitFailure(
        io,
        options.json,
        failureEnvelope(
          COMMAND,
          'install_failed',
          error instanceof Error ? error.message : String(error)
        )
      );
      return 1;
    }
  }

  const manifest: Manifest = {
    flavor: detection.flavor,
    framework: detection.framework,
    typescript: detection.typescript,
    componentsPath,
    libPath,
    aliases: detection.aliases,
    algolia: { appId, searchApiKey, ...(indexName ? { indexName } : {}) },
    features: [],
  };

  const writeResult = writeManifest(manifestPath, manifest, {
    command: COMMAND,
  });
  if (!writeResult.ok) {
    emitFailure(io, options.json, writeResult);
    return 1;
  }

  // Credentials that already live in the project's env stay there: the client reads
  // the browser-safe copies instead of inlining them, when the bundler supports it.
  const envPrefix = publicEnvPrefix(options.cwd);
  const useEnv = credentialsSource === 'env' && envPrefix !== null;

  const libDir = path.join(options.cwd, libPath);
  const clientPath = path.join(
    libDir,
    `algolia-client.${detection.typescript ? 'ts' : 'js'}`
  );
  const providerPath = path.join(
    libDir,
    `algolia-provider.${detection.typescript ? 'tsx' : 'jsx'}`
  );

  const createdByThisRun: string[] = [manifestPath];
  try {
    fs.mkdirSync(libDir, { recursive: true });
    fs.writeFileSync(
      clientPath,
      useEnv
        ? renderEnvClient(envPrefix)
        : renderClient(appId, searchApiKey, indexName),
      { encoding: 'utf8', flag: 'wx' }
    );
    createdByThisRun.push(clientPath);
    fs.writeFileSync(
      providerPath,
      renderProvider({
        framework: detection.framework,
        typescript: detection.typescript,
      }),
      { encoding: 'utf8', flag: 'wx' }
    );
    createdByThisRun.push(providerPath);
  } catch (error) {
    rollback(createdByThisRun);
    emitFailure(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'write_failed',
        `Could not write scaffolded files under ${libDir}: ${
          error instanceof Error ? error.message : String(error)
        }`
      )
    );
    return 1;
  }

  const filesModified: string[] = [];
  if (useEnv) {
    const envFile = writePublicEnv(options.cwd, envPrefix, {
      appId,
      searchApiKey,
      indexName,
    });
    if (envFile) filesModified.push(envFile);
  }

  const filesCreated = [manifestPath, clientPath, providerPath];
  const libImport = (name: string) =>
    `./${path.posix.join(libPath.replace(/\\/g, '/'), name)}`;

  emitSuccess(io, options.json, {
    filesCreated,
    filesModified,
    providerImport: libImport('algolia-provider'),
    clientImport: libImport('algolia-client'),
    indexName,
    exportsIndexName: useEnv || Boolean(indexName),
    cacheComponents:
      detection.framework === 'next-app' &&
      nextCacheComponentsEnabled(options.cwd),
    privilegedKeys: readProjectCredentials(options.cwd, options.env)
      .privilegedKeyVariables,
  });
  return 0;
}

type ResolvedInputs = {
  appId: string;
  searchApiKey: string;
  indexName?: string;
  componentsPath: string;
  libPath: string;
  credentialsSource: 'flags' | 'env' | 'prompt';
};

async function resolveInputs(
  options: InitOptions,
  io: IO
): Promise<{ ok: true; value: ResolvedInputs } | { ok: false }> {
  const projectEnv = readProjectCredentials(options.cwd, options.env);
  const envAppId = projectEnv.appId?.value;
  const envSearchKey = projectEnv.searchApiKey?.value;
  const indexName = projectEnv.indexName?.value;
  const fromFlags = Boolean(options.appId || options.searchApiKey);

  if (options.yes) {
    const appId = options.appId ?? envAppId;
    const searchApiKey = options.searchApiKey ?? envSearchKey;
    if (!appId) {
      emitFailure(
        io,
        options.json,
        failureEnvelope(
          COMMAND,
          'missing_required_flag',
          '--app-id is required in non-interactive mode (--yes or --json), or set ALGOLIA_APP_ID in .env.local.'
        )
      );
      return { ok: false };
    }
    if (!searchApiKey) {
      emitFailure(
        io,
        options.json,
        failureEnvelope(
          COMMAND,
          'missing_required_flag',
          '--search-api-key is required in non-interactive mode (--yes or --json), or set ALGOLIA_SEARCH_API_KEY in .env.local.'
        )
      );
      return { ok: false };
    }

    const componentsPath =
      options.componentsPath ?? defaultComponentsPath(options.cwd);
    const libPath = options.libPath ?? deriveLibPath(componentsPath);

    return {
      ok: true,
      value: {
        appId,
        searchApiKey,
        indexName,
        componentsPath,
        libPath,
        credentialsSource: fromFlags ? 'flags' : 'env',
      },
    };
  }

  const useEnvCredentials = !fromFlags && Boolean(envAppId && envSearchKey);
  const promptFn = options.prompt ?? defaultPrompt;
  const componentsDefault =
    options.componentsPath ?? defaultComponentsPath(options.cwd);
  const libDefault = options.libPath ?? deriveLibPath(componentsDefault);

  const questions: PromptQuestion[] = [];
  if (!options.appId && !useEnvCredentials) {
    questions.push({
      type: 'text',
      name: 'appId',
      message: 'Algolia Application ID',
    });
  }
  if (!options.searchApiKey && !useEnvCredentials) {
    questions.push({
      type: 'password',
      name: 'searchApiKey',
      message: 'Algolia Search API Key',
    });
  }
  if (!options.componentsPath) {
    questions.push({
      type: 'text',
      name: 'componentsPath',
      message: 'Components path',
      initial: componentsDefault,
    });
  }
  if (!options.libPath) {
    questions.push({
      type: 'text',
      name: 'libPath',
      message: 'Lib path',
      initial: libDefault,
    });
  }

  const answers = questions.length > 0 ? await promptFn(questions) : {};

  if (
    questions.length > 0 &&
    questions.some((q) => {
      const value = (answers as Record<string, unknown>)[q.name];
      // prompts returns {} on Ctrl-C (key absent) and '' on empty submit — both mean the user gave up.
      return value === undefined || value === null || value === '';
    })
  ) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(COMMAND, 'cancelled', 'Cancelled by user.')
    );
    return { ok: false };
  }

  const appId = options.appId ?? (useEnvCredentials ? envAppId : answers.appId);
  const searchApiKey =
    options.searchApiKey ??
    (useEnvCredentials ? envSearchKey : answers.searchApiKey);
  if (!appId || !searchApiKey) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'missing_required_flag',
        'Algolia Application ID and Search API Key are required.'
      )
    );
    return { ok: false };
  }

  const componentsPath =
    options.componentsPath ?? answers.componentsPath ?? componentsDefault;
  const libPath =
    options.libPath ?? answers.libPath ?? deriveLibPath(componentsPath);

  return {
    ok: true,
    value: {
      appId,
      searchApiKey,
      indexName,
      componentsPath,
      libPath,
      credentialsSource: fromFlags
        ? 'flags'
        : useEnvCredentials
          ? 'env'
          : 'prompt',
    },
  };
}

/** Follow the project's layout: root-level app/, pages/, or components/ without src/ means no src/ prefix. */
export function defaultComponentsPath(cwd: string): string {
  if (fs.existsSync(path.join(cwd, 'src'))) return 'src/components';
  const rootLayout = ['app', 'pages', 'components'].some((dir) =>
    fs.existsSync(path.join(cwd, dir))
  );
  return rootLayout ? 'components' : 'src/components';
}

export function deriveLibPath(componentsPath: string): string {
  const normalized = componentsPath.replace(/\\/g, '/').replace(/\/+$/, '');
  return normalized === 'src/components' ? 'src/lib' : 'lib';
}

export function looksLikeEmptyProject(cwd: string): boolean {
  if (APP_MARKERS.some((marker) => fs.existsSync(path.join(cwd, marker)))) {
    return false;
  }
  try {
    const pkg = JSON.parse(
      fs.readFileSync(path.join(cwd, 'package.json'), 'utf8')
    ) as {
      dependencies?: Record<string, string>;
      devDependencies?: Record<string, string>;
    };
    const deps = {
      ...(pkg.dependencies ?? {}),
      ...(pkg.devDependencies ?? {}),
    };
    return !UI_DEPENDENCIES.some((name) => name in deps);
  } catch {
    return true;
  }
}

function noAppEnvelope(options: InitOptions) {
  const env = readProjectCredentials(options.cwd, options.env);
  const appId = options.appId ?? env.appId?.value ?? '<APP_ID>';
  const searchApiKey =
    options.searchApiKey ?? env.searchApiKey?.value ?? '<SEARCH_API_KEY>';
  const indexName = env.indexName?.value ?? '<INDEX_NAME>';
  return failureEnvelope(
    COMMAND,
    'no_app_detected',
    'No app found in this folder. init adds InstantSearch to an existing project; to start a new one, generate it from a template.',
    [
      `Run \`${npxCommand(
        'introspect --json'
      )}\` and run data.createInstantSearchAppCommand: it fills in display, image, and facet attributes from the index.`,
      `Or run: ${npxCommand(
        `search-app --template "React InstantSearch" --app-id ${appId} --api-key ${searchApiKey} --index-name ${indexName} --enable-insights --no-interactive`
      )}`,
    ]
  );
}

function findMissingPackages(cwd: string, packages: string[]): string[] {
  let pkg: {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return packages;
  }
  const installed = new Set([
    ...Object.keys(pkg.dependencies ?? {}),
    ...Object.keys(pkg.devDependencies ?? {}),
  ]);
  return packages.filter((name) => !installed.has(name));
}

function detectPackageManager(cwd: string): PackageManager {
  if (fs.existsSync(path.join(cwd, 'pnpm-lock.yaml'))) return 'pnpm';
  if (fs.existsSync(path.join(cwd, 'bun.lockb'))) return 'bun';
  if (fs.existsSync(path.join(cwd, 'yarn.lock'))) return 'yarn';
  return 'npm';
}

const defaultInstaller: Installer = async (packages, { cwd, manager }) => {
  const { spawn } = await import('child_process');
  const args =
    manager === 'npm' ? ['install', ...packages] : ['add', ...packages];

  await new Promise<void>((resolve, reject) => {
    // npm/yarn/pnpm install on Windows as .cmd shims; spawn auto-resolves .exe only.
    // bun ships as bun.exe, so it doesn't need the suffix.
    const command =
      process.platform === 'win32' && manager !== 'bun'
        ? `${manager}.cmd`
        : manager;
    // Pipe child stdout to our stderr so install logs don't contaminate the JSON envelope on stdout.
    const child = spawn(command, args, {
      cwd,
      stdio: ['ignore', process.stderr, process.stderr],
    });
    child.on('error', reject);
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(`${manager} ${args.join(' ')} exited with code ${code}.`)
        );
    });
  });
};

const defaultPrompt: PromptFn = async (questions) => {
  const { default: prompts } = await import('prompts');
  return prompts(questions) as Promise<PromptAnswers>;
};

function isSafeRelativePath(input: string): boolean {
  if (path.isAbsolute(input)) return false;
  const segments = input.split(/[/\\]/);
  return !segments.includes('..');
}

function rollback(paths: string[]): void {
  // Best-effort: delete in reverse order, swallow any IO error so the original failure stays the headline.
  for (let i = paths.length - 1; i >= 0; i -= 1) {
    try {
      fs.unlinkSync(paths[i]);
    } catch {
      // ignore
    }
  }
}

function emitFailure(
  io: IO,
  json: boolean,
  envelope: ReturnType<typeof failureEnvelope>
): void {
  if (json) {
    io.stdout(formatEnvelope(envelope));
  } else {
    io.stderr(`${envelope.message}\n`);
    for (const step of envelope.nextSteps ?? []) io.stderr(`  - ${step}\n`);
  }
}

function emitSuccess(
  io: IO,
  json: boolean,
  details: {
    filesCreated: string[];
    filesModified: string[];
    providerImport: string;
    clientImport: string;
    indexName?: string;
    exportsIndexName: boolean;
    cacheComponents: boolean;
    privilegedKeys: string[];
  }
): void {
  const nextSteps = [
    `Import { AlgoliaProvider } from '${details.providerImport}' to wrap your app's search UI.`,
    `Add an <Index indexName="..."> wrapper around each feature that targets a specific Algolia index.`,
  ];
  if (details.exportsIndexName) {
    nextSteps.push(
      `Use the indexName export from '${details.clientImport}' for that wrapper${
        details.indexName ? ` (currently "${details.indexName}")` : ''
      }.`
    );
  }
  if (details.cacheComponents) {
    nextSteps.push(
      "next.config enables cacheComponents: render <AlgoliaProvider> inside <Suspense>, under a server component that awaits connection() from 'next/server'. Otherwise next build fails while prerendering."
    );
  }
  if (details.privilegedKeys.length > 0) {
    nextSteps.push(
      `${details.privilegedKeys.join(', ')} is set in this project: keep it server-side. It was not copied to browser-exposed variables.`
    );
  }
  nextSteps.push(
    `Run \`${npxCommand(
      'introspect --json'
    )}\` for a widget plan built from the index, and offer the user 2-3 UI options before building.`,
    `Run \`${npxCommand(
      'agents-md'
    )}\` so future agent sessions know about these files and the installed InstantSearch version.`,
    'Verify in a browser: start the dev server, type a query, and apply a refinement.'
  );

  const envelope = successEnvelope(COMMAND, {
    filesCreated: details.filesCreated,
    filesModified: details.filesModified,
    nextSteps,
  });
  if (json) {
    io.stdout(formatEnvelope(envelope));
  } else {
    io.stdout(`init: created ${details.filesCreated.length} files\n`);
    for (const file of details.filesCreated) {
      io.stdout(`  - ${file}\n`);
    }
    for (const file of details.filesModified) {
      io.stdout(`  ~ ${file}\n`);
    }
  }
}

function renderClient(
  appId: string,
  searchApiKey: string,
  indexName?: string
): string {
  return `import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Module-scoped so the reference stays stable across renders and InstantSearch's request cache survives.
export const searchClient = algoliasearch(
  ${JSON.stringify(appId)},
  ${JSON.stringify(searchApiKey)}
);
${indexName ? `\nexport const indexName = ${JSON.stringify(indexName)};\n` : ''}`;
}

function renderEnvClient(prefix: string): string {
  const read = (name: string) =>
    prefix === 'VITE_' || prefix === 'PUBLIC_'
      ? `import.meta.env.${prefix}${name}`
      : `process.env.${prefix}${name}`;
  return `import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Browser-safe values (search-only key) from .env.local.
// Module-scoped so the reference stays stable across renders and InstantSearch's request cache survives.
export const searchClient = algoliasearch(
  ${read('ALGOLIA_APP_ID')} ?? '',
  ${read('ALGOLIA_SEARCH_API_KEY')} ?? ''
);

export const indexName = ${read('ALGOLIA_INDEX_NAME')} ?? '';
`;
}

function renderProvider(detection: {
  framework?: string;
  typescript: boolean;
}): string {
  const isNext = detection.framework === 'next-app';
  const useClient = isNext ? "'use client';\n\n" : '';
  const importLine = isNext
    ? "import { InstantSearchNext } from 'react-instantsearch-nextjs';"
    : "import { InstantSearch } from 'react-instantsearch';";
  const componentName = isNext ? 'InstantSearchNext' : 'InstantSearch';

  const reactImport = detection.typescript
    ? "import type { ReactNode } from 'react';\n"
    : '';
  const typedChildren = detection.typescript ? ': { children: ReactNode }' : '';

  return `${useClient}${reactImport}${importLine}

import { searchClient } from './algolia-client';

export function AlgoliaProvider({ children }${typedChildren}) {
  return (
    <${componentName} searchClient={searchClient} insights>
      {children}
    </${componentName}>
  );
}
`;
}
