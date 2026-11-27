import fs from 'fs';
import path from 'path';

// Variable names used by the places credentials come from: Stripe Projects
// (ALGOLIA_APPLICATION_ID), the Vercel Marketplace (ALGOLIA_APP_ID), and the
// public prefixes frameworks expose to the browser.
const PUBLIC_PREFIXES = [
  '',
  'NEXT_PUBLIC_',
  'VITE_',
  'PUBLIC_',
  'NUXT_PUBLIC_',
  'REACT_APP_',
];
const APP_ID_NAMES = ['ALGOLIA_APP_ID', 'ALGOLIA_APPLICATION_ID'];
const SEARCH_KEY_NAMES = [
  'ALGOLIA_SEARCH_API_KEY',
  'ALGOLIA_SEARCH_KEY',
  'ALGOLIA_SEARCH_ONLY_API_KEY',
];
const INDEX_NAMES = ['ALGOLIA_INDEX_NAME', 'ALGOLIA_INDEX'];
const PRIVILEGED_KEY_NAMES = [
  'ALGOLIA_WRITE_API_KEY',
  'ALGOLIA_ADMIN_API_KEY',
  'ALGOLIA_ADMIN_KEY',
];

// Later files win, matching how Next.js and Vite layer them. The process
// environment wins over every file.
export const ENV_FILES = [
  '.env',
  '.env.development',
  '.env.local',
  '.env.development.local',
];

type Found = { value: string; variable: string; file?: string };

export type ProjectCredentials = {
  appId?: Found;
  searchApiKey?: Found;
  indexName?: Found;
  /** Names (never values) of write/admin keys present in the project env. */
  privilegedKeyVariables: string[];
};

export function parseEnvFile(contents: string): Record<string, string> {
  const values: Record<string, string> = {};
  for (const rawLine of contents.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/.exec(
      line
    );
    if (!match) continue;
    let value = match[2].trim();
    const quoted = /^(['"])(.*)\1$/.exec(value);
    if (quoted) value = quoted[2];
    else value = value.replace(/\s+#.*$/, '');
    values[match[1]] = value;
  }
  return values;
}

export function readProjectCredentials(
  cwd: string,
  env: Record<string, string | undefined> = process.env
): ProjectCredentials {
  const layers: Array<{ values: Record<string, string>; file?: string }> = [];
  for (const file of ENV_FILES) {
    const filePath = path.join(cwd, file);
    if (!fs.existsSync(filePath)) continue;
    try {
      layers.push({
        values: parseEnvFile(fs.readFileSync(filePath, 'utf8')),
        file,
      });
    } catch {
      // unreadable env file: ignore it like the frameworks do
    }
  }
  const processValues: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    if (typeof value === 'string') processValues[key] = value;
  }
  layers.push({ values: processValues });

  const lookup = (names: string[]): Found | undefined => {
    const candidates = PUBLIC_PREFIXES.flatMap((prefix) =>
      names.map((name) => `${prefix}${name}`)
    );
    for (let i = layers.length - 1; i >= 0; i--) {
      for (const variable of candidates) {
        const value = layers[i].values[variable];
        if (value) return { value, variable, file: layers[i].file };
      }
    }
    return undefined;
  };

  const privilegedKeyVariables = PRIVILEGED_KEY_NAMES.filter((name) =>
    layers.some((layer) => Boolean(layer.values[name]))
  );

  return {
    appId: lookup(APP_ID_NAMES),
    searchApiKey: lookup(SEARCH_KEY_NAMES),
    indexName: lookup(INDEX_NAMES),
    privilegedKeyVariables,
  };
}

type PackageJson = {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
};

/** Prefix the project's bundler requires before it exposes a variable to browser code. */
export function publicEnvPrefix(cwd: string): string | null {
  let pkg: PackageJson;
  try {
    pkg = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'));
  } catch {
    return null;
  }
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  if ('next' in deps) return 'NEXT_PUBLIC_';
  if ('nuxt' in deps) return 'NUXT_PUBLIC_';
  if ('@sveltejs/kit' in deps || 'astro' in deps) return 'PUBLIC_';
  if ('vite' in deps) return 'VITE_';
  if ('react-scripts' in deps) return 'REACT_APP_';
  return null;
}

/**
 * Appends the browser-safe variables (app ID, search-only key, index) to
 * .env.local under the project's public prefix. Existing variables are left
 * untouched. Returns the file path when it changed it.
 */
export function writePublicEnv(
  cwd: string,
  prefix: string,
  values: { appId: string; searchApiKey: string; indexName?: string }
): string | null {
  const filePath = path.join(cwd, '.env.local');
  const existing = fs.existsSync(filePath)
    ? fs.readFileSync(filePath, 'utf8')
    : '';
  const present = parseEnvFile(existing);
  const wanted: Array<[string, string | undefined]> = [
    [`${prefix}ALGOLIA_APP_ID`, values.appId],
    [`${prefix}ALGOLIA_SEARCH_API_KEY`, values.searchApiKey],
    [`${prefix}ALGOLIA_INDEX_NAME`, values.indexName],
  ];
  const missing = wanted.filter(
    ([name, value]) => value && present[name] === undefined
  );
  if (missing.length === 0) return null;
  const separator = existing && !existing.endsWith('\n') ? '\n' : '';
  const block = [
    '# Browser-safe Algolia values (search-only key). Added by create-instantsearch-app.',
    ...missing.map(([name, value]) => `${name}=${value}`),
  ].join('\n');
  fs.writeFileSync(
    filePath,
    `${existing}${separator}${existing ? '\n' : ''}${block}\n`,
    'utf8'
  );
  return filePath;
}
