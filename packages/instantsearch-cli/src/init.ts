import fs from 'fs';
import path from 'path';

import { detect } from './detector';
import {
  failureEnvelope,
  formatEnvelope,
  successEnvelope,
} from './envelope';
import { writeManifest, type Manifest } from './manifest';

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
};

const COMMAND = 'init';
const MANIFEST_FILENAME = 'instantsearch.json';

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
    emitFailure(io, options.json, detection);
    return 1;
  }

  const credentialsResult = await resolveInputs(options, io);
  if (!credentialsResult.ok) return 1;

  const {
    appId,
    searchApiKey,
    componentsPath,
    libPath,
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
    algolia: { appId, searchApiKey },
    features: [],
  };

  const writeResult = writeManifest(manifestPath, manifest, {
    command: COMMAND,
  });
  if (!writeResult.ok) {
    emitFailure(io, options.json, writeResult);
    return 1;
  }

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
    fs.writeFileSync(clientPath, renderClient(appId, searchApiKey), {
      encoding: 'utf8',
      flag: 'wx',
    });
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

  const filesCreated = [manifestPath, clientPath, providerPath];

  const providerImport = `./${path.posix.join(
    libPath.replace(/\\/g, '/'),
    'algolia-provider'
  )}`;

  emitSuccess(io, options.json, filesCreated, providerImport);
  return 0;
}

type ResolvedInputs = {
  appId: string;
  searchApiKey: string;
  componentsPath: string;
  libPath: string;
};

async function resolveInputs(
  options: InitOptions,
  io: IO
): Promise<{ ok: true; value: ResolvedInputs } | { ok: false }> {
  if (options.yes) {
    if (!options.appId) {
      emitFailure(
        io,
        options.json,
        failureEnvelope(
          COMMAND,
          'missing_required_flag',
          '--app-id is required in non-interactive mode (--yes or --json).'
        )
      );
      return { ok: false };
    }
    if (!options.searchApiKey) {
      emitFailure(
        io,
        options.json,
        failureEnvelope(
          COMMAND,
          'missing_required_flag',
          '--search-api-key is required in non-interactive mode (--yes or --json).'
        )
      );
      return { ok: false };
    }

    const componentsPath = options.componentsPath ?? 'src/components';
    const libPath = options.libPath ?? deriveLibPath(componentsPath);

    return {
      ok: true,
      value: {
        appId: options.appId,
        searchApiKey: options.searchApiKey,
        componentsPath,
        libPath,
      },
    };
  }

  const promptFn = options.prompt ?? defaultPrompt;
  const componentsDefault = options.componentsPath ?? 'src/components';
  const libDefault =
    options.libPath ?? deriveLibPath(componentsDefault);

  const questions: PromptQuestion[] = [];
  if (!options.appId) {
    questions.push({
      type: 'text',
      name: 'appId',
      message: 'Algolia Application ID',
    });
  }
  if (!options.searchApiKey) {
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

  const appId = options.appId ?? answers.appId;
  const searchApiKey = options.searchApiKey ?? answers.searchApiKey;
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
    value: { appId, searchApiKey, componentsPath, libPath },
  };
}

export function deriveLibPath(componentsPath: string): string {
  const normalized = componentsPath.replace(/\\/g, '/').replace(/\/+$/, '');
  return normalized === 'src/components' ? 'src/lib' : 'lib';
}

function findMissingPackages(cwd: string, packages: string[]): string[] {
  let pkg: { dependencies?: Record<string, string>; devDependencies?: Record<string, string> };
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
    manager === 'npm'
      ? ['install', ...packages]
      : ['add', ...packages];

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
      else reject(new Error(`${manager} ${args.join(' ')} exited with code ${code}.`));
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
  }
}

function emitSuccess(
  io: IO,
  json: boolean,
  filesCreated: string[],
  providerImport: string
): void {
  const envelope = successEnvelope(COMMAND, {
    filesCreated,
    nextSteps: [
      `Import { AlgoliaProvider } from '${providerImport}' to wrap your app's search UI.`,
      `Add an <Index indexName="..."> wrapper around each feature that targets a specific Algolia index.`,
    ],
  });
  if (json) {
    io.stdout(formatEnvelope(envelope));
  } else {
    io.stdout(`init: created ${filesCreated.length} files\n`);
    for (const file of filesCreated) {
      io.stdout(`  - ${file}\n`);
    }
  }
}

function renderClient(appId: string, searchApiKey: string): string {
  return `import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Module-scoped so the reference stays stable across renders and InstantSearch's request cache survives.
export const searchClient = algoliasearch(
  ${JSON.stringify(appId)},
  ${JSON.stringify(searchApiKey)}
);
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
  const typedChildren = detection.typescript
    ? ': { children: ReactNode }'
    : '';

  return `${useClient}${reactImport}${importLine}

import { searchClient } from './algolia-client';

export function AlgoliaProvider({ children }${typedChildren}) {
  return (
    <${componentName} searchClient={searchClient}>
      {children}
    </${componentName}>
  );
}
`;
}
