import fs from 'fs';
import path from 'path';

import * as jsonc from 'jsonc-parser';

import { failureEnvelope } from './envelope';

type Flavor = 'react' | 'js';
type Framework = 'vite' | 'next-app';

type RefusalCode =
  | 'unsupported_flavor'
  | 'unsupported_framework'
  | 'ambiguous_framework';

type DetectionSuccess = {
  ok: true;
  flavor: Flavor;
  framework: Framework;
  typescript: boolean;
  aliases: Record<string, string[]>;
};

type DetectionFailure = ReturnType<typeof failureEnvelope>;

export type DetectionResult = DetectionSuccess | DetectionFailure;

function refuse(
  command: string,
  code: RefusalCode,
  message: string
): DetectionFailure {
  return failureEnvelope(command, code, message);
}

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

type TsConfig = {
  compilerOptions?: {
    paths?: Record<string, string[]>;
  };
};

export function detect(
  projectRoot: string,
  options: { command: string }
): DetectionResult {
  const { command } = options;

  const pkg = readJsonFile<PackageJson>(path.join(projectRoot, 'package.json'));
  if (!pkg) {
    return refuse(
      command,
      'unsupported_flavor',
      'Could not read package.json at the project root.'
    );
  }

  const deps: Record<string, string> = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
  };

  const flavor = detectFlavor(deps);
  if (!flavor) {
    return refuse(
      command,
      'unsupported_flavor',
      'Host framework is not supported yet. Only React and Next.js (App Router) are supported.'
    );
  }

  const frameworkResult = detectFramework(projectRoot, deps, command);
  if (!frameworkResult.ok) {
    return frameworkResult;
  }

  const tsconfigPath = path.join(projectRoot, 'tsconfig.json');
  const typescript = fs.existsSync(tsconfigPath);
  const tsconfig = typescript ? readJsoncFile<TsConfig>(tsconfigPath) : null;

  return {
    ok: true,
    flavor,
    framework: frameworkResult.framework,
    typescript,
    aliases: tsconfig?.compilerOptions?.paths ?? {},
  };
}

function detectFlavor(deps: Record<string, string>): Flavor | null {
  if ('react' in deps) return 'react';
  return null;
}

type FrameworkOk = { ok: true; framework: Framework };

function detectFramework(
  projectRoot: string,
  deps: Record<string, string>,
  command: string
): FrameworkOk | DetectionFailure {
  if ('next' in deps) {
    const hasAppDir =
      isDirectory(path.join(projectRoot, 'app')) ||
      isDirectory(path.join(projectRoot, 'src', 'app'));
    const hasPagesDir =
      isDirectory(path.join(projectRoot, 'pages')) ||
      isDirectory(path.join(projectRoot, 'src', 'pages'));

    if (hasAppDir && hasPagesDir) {
      return refuse(
        command,
        'ambiguous_framework',
        'Next.js project contains both App Router and Pages Router directories. Pass --framework to disambiguate.'
      );
    }
    if (hasAppDir) {
      return { ok: true, framework: 'next-app' };
    }
    return refuse(
      command,
      'unsupported_framework',
      'Next.js Pages Router is not supported yet. Only the App Router is supported.'
    );
  }

  if ('vite' in deps) {
    return { ok: true, framework: 'vite' };
  }
  return refuse(
    command,
    'unsupported_framework',
    'Could not identify a supported React framework. InstantSearch CLI currently supports Vite-based React projects.'
  );
}

function readJsonFile<T>(filePath: string): T | null {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(contents) as T;
  } catch {
    return null;
  }
}

function readJsoncFile<T>(filePath: string): T | null {
  try {
    const contents = fs.readFileSync(filePath, 'utf8');
    const value = jsonc.parse(contents, undefined, {
      allowTrailingComma: true,
    }) as T | undefined;
    if (value === undefined) {
      return null;
    }
    return value;
  } catch {
    return null;
  }
}

function isDirectory(dirPath: string): boolean {
  try {
    return fs.statSync(dirPath).isDirectory();
  } catch {
    return false;
  }
}
