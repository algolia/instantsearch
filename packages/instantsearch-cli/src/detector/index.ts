import fs from 'node:fs';
import path from 'node:path';

import type { Flavor, Framework } from '../types';

export type Detection = {
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  componentsPath: string;
  aliases: Record<string, string>;
  packagesToInstall?: string[];
};

export type DetectSuccess = { ok: true; detection: Detection };
export type DetectFailure = { ok: false; code: string; message: string };
export type DetectResult = DetectSuccess | DetectFailure;

function readJSON(filePath: string): Record<string, any> | null {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function collectDependencies(
  packageJson: Record<string, any>
): Record<string, string> {
  return {
    ...(packageJson.dependencies ?? {}),
    ...(packageJson.devDependencies ?? {}),
  };
}

function extractComponentsAlias(
  tsconfig: Record<string, any> | null
): string | null {
  const paths = tsconfig?.compilerOptions?.paths as
    | Record<string, string[]>
    | undefined;
  if (!paths) return null;

  for (const alias of Object.keys(paths)) {
    const match = alias.match(/^(.+\/components)\/\*$/);
    if (match) {
      return match[1];
    }
  }
  return null;
}

type ProjectMeta = {
  typescript: boolean;
  componentsPath: string;
  aliases: Record<string, string>;
};

function detectProjectMeta(projectDir: string): ProjectMeta {
  const tsconfig = readJSON(path.join(projectDir, 'tsconfig.json'));
  const typescript = tsconfig !== null;
  const hasSrc = fs.existsSync(path.join(projectDir, 'src'));
  const componentsPath = hasSrc ? 'src/components' : 'components';

  const aliases: Record<string, string> = {};
  const componentsAlias = extractComponentsAlias(tsconfig);
  if (componentsAlias) {
    aliases.components = componentsAlias;
  }

  return { typescript, componentsPath, aliases };
}

export type DetectOptions = {
  frameworkOverride?: Framework;
};

export function detect(
  projectDir: string,
  options: DetectOptions = {}
): DetectResult {
  const packageJson = readJSON(path.join(projectDir, 'package.json'));
  if (!packageJson) {
    return {
      ok: false,
      code: 'unsupported_framework',
      message:
        'No package.json found. InstantSearch CLI requires an existing project.',
    };
  }

  const deps = collectDependencies(packageJson);
  const hasReactIs = Boolean(deps['react-instantsearch']);
  const hasNextIs = Boolean(deps['react-instantsearch-nextjs']);
  const hasJsIs = Boolean(deps['instantsearch.js']);

  const flavors: Flavor[] = [];
  if (hasReactIs || hasNextIs) flavors.push('react');
  if (hasJsIs) flavors.push('js');

  if (flavors.length === 0) {
    const hasReact = Boolean(deps['react']);
    const hasNext = Boolean(deps['next']);

    let inferredFlavor: Flavor;
    let inferredFramework: Framework | null = null;
    const packagesToInstall: string[] = [];

    if (hasNext) {
      inferredFlavor = 'react';
      inferredFramework = 'nextjs';
      packagesToInstall.push('react-instantsearch', 'react-instantsearch-nextjs');
    } else if (hasReact) {
      inferredFlavor = 'react';
      packagesToInstall.push('react-instantsearch');
    } else {
      inferredFlavor = 'js';
      packagesToInstall.push('instantsearch.js');
    }

    if (!deps['algoliasearch']) {
      packagesToInstall.push('algoliasearch');
    }

    return {
      ok: true,
      detection: {
        flavor: inferredFlavor,
        framework: inferredFramework,
        ...detectProjectMeta(projectDir),
        packagesToInstall,
      },
    };
  }

  if (flavors.length > 1) {
    return {
      ok: false,
      code: 'unsupported_framework',
      message:
        'Ambiguous flavor: both react-instantsearch and instantsearch.js are installed. Pass --flavor react or --flavor js explicitly.',
    };
  }

  const flavor = flavors[0];
  const { frameworkOverride } = options;

  let framework: Framework | null = null;
  if (frameworkOverride !== undefined) {
    framework = frameworkOverride;
  } else if (hasNextIs) {
    const hasAppDir = fs.existsSync(path.join(projectDir, 'app'));
    const hasPagesDir = fs.existsSync(path.join(projectDir, 'pages'));
    if (hasAppDir && hasPagesDir) {
      return {
        ok: false,
        code: 'unsupported_framework',
        message:
          'Ambiguous Next.js layout: both app/ and pages/ directories exist. Pass --framework nextjs explicitly to proceed.',
      };
    }
    if (hasAppDir) {
      framework = 'nextjs';
    }
  }

  return {
    ok: true,
    detection: {
      flavor,
      framework,
      ...detectProjectMeta(projectDir),
    },
  };
}
