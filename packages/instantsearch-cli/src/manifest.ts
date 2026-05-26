import fs from 'fs';

import { failureEnvelope } from './envelope';

export const MANIFEST_API_VERSION = 1;

export type Manifest = {
  apiVersion: typeof MANIFEST_API_VERSION;
  flavor: string;
  framework?: string;
  typescript: boolean;
  componentsPath: string;
  libPath: string;
  aliases: Record<string, string[]>;
  algolia: {
    appId: string;
    searchApiKey: string;
  };
  features: Array<{
    name: string;
    path: string;
    indexName: string;
  }>;
};

type RefusalCode = 'invalid_manifest' | 'not_found' | 'manifest_exists';

type ManifestFailure = ReturnType<typeof failureEnvelope>;

type ReadResult = { ok: true; manifest: Manifest } | ManifestFailure;
type WriteResult = { ok: true; path: string } | ManifestFailure;
type ValidateResult = { ok: true; manifest: Manifest } | ManifestFailure;

type Options = { command: string };

function refuse(
  command: string,
  code: RefusalCode,
  message: string
): ManifestFailure {
  return failureEnvelope(command, code, message);
}

export function readManifest(
  filePath: string,
  options: Options
): ReadResult {
  const { command } = options;

  let contents: string;
  try {
    contents = fs.readFileSync(filePath, 'utf8');
  } catch (error) {
    if (errorCode(error) === 'ENOENT') {
      return refuse(command, 'not_found', `Manifest not found at ${filePath}.`);
    }
    return refuse(
      command,
      'invalid_manifest',
      `Failed to read manifest at ${filePath}: ${describeError(error)}`
    );
  }

  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch (error) {
    return refuse(
      command,
      'invalid_manifest',
      `Manifest at ${filePath} is not valid JSON: ${describeError(error)}`
    );
  }

  return validateManifest(parsed, options);
}

export function writeManifest(
  filePath: string,
  manifest: Manifest,
  options: Options
): WriteResult {
  const { command } = options;

  try {
    fs.writeFileSync(filePath, serializeManifest(manifest), {
      encoding: 'utf8',
      flag: 'wx',
    });
  } catch (error) {
    if (errorCode(error) === 'EEXIST') {
      return refuse(
        command,
        'manifest_exists',
        `A manifest already exists at ${filePath}.`
      );
    }
    throw error;
  }
  return { ok: true, path: filePath };
}

export function validateManifest(
  value: unknown,
  options: Options
): ValidateResult {
  const error = checkManifest(value);
  if (error) {
    return refuse(options.command, 'invalid_manifest', error);
  }
  return { ok: true, manifest: value as Manifest };
}

export function serializeManifest(manifest: Manifest): string {
  return `${JSON.stringify(manifest, null, 2)}\n`;
}

function checkManifest(value: unknown): string | null {
  if (!isPlainObject(value)) {
    return 'Manifest must be a JSON object.';
  }

  if (value.apiVersion !== MANIFEST_API_VERSION) {
    return `Manifest "apiVersion" must equal ${MANIFEST_API_VERSION}.`;
  }

  for (const key of ['flavor', 'componentsPath', 'libPath']) {
    const entry = value[key];
    if (typeof entry !== 'string' || entry.length === 0) {
      return `Manifest "${key}" must be a non-empty string.`;
    }
  }

  if (
    value.framework !== undefined &&
    (typeof value.framework !== 'string' || value.framework.length === 0)
  ) {
    return 'Manifest "framework" must be a non-empty string when present.';
  }

  if (typeof value.typescript !== 'boolean') {
    return 'Manifest "typescript" must be a boolean.';
  }

  const aliasesError = checkAliases(value.aliases);
  if (aliasesError) return aliasesError;

  const algoliaError = checkAlgolia(value.algolia);
  if (algoliaError) return algoliaError;

  const featuresError = checkFeatures(value.features);
  if (featuresError) return featuresError;

  return null;
}

function checkAliases(value: unknown): string | null {
  if (!isPlainObject(value)) {
    return 'Manifest "aliases" must be an object mapping aliases to string arrays.';
  }
  for (const [key, entries] of Object.entries(value)) {
    if (!Array.isArray(entries) || !entries.every((e) => typeof e === 'string')) {
      return `Manifest "aliases.${key}" must be an array of strings.`;
    }
  }
  return null;
}

function checkAlgolia(value: unknown): string | null {
  if (!isPlainObject(value)) {
    return 'Manifest "algolia" must be an object.';
  }
  for (const key of ['appId', 'searchApiKey']) {
    if (typeof value[key] !== 'string') {
      return `Manifest "algolia.${key}" must be a string.`;
    }
  }
  return null;
}

function checkFeatures(value: unknown): string | null {
  if (!Array.isArray(value)) {
    return 'Manifest "features" must be an array.';
  }
  for (let i = 0; i < value.length; i++) {
    const feature = value[i];
    if (!isPlainObject(feature)) {
      return `Manifest "features[${i}]" must be an object.`;
    }
    for (const key of ['name', 'path', 'indexName']) {
      const entry = feature[key];
      if (typeof entry !== 'string' || entry.length === 0) {
        return `Manifest "features[${i}].${key}" must be a non-empty string.`;
      }
    }
  }
  return null;
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function errorCode(error: unknown): string | undefined {
  if (typeof error === 'object' && error !== null && 'code' in error) {
    const code = (error as { code: unknown }).code;
    return typeof code === 'string' ? code : undefined;
  }
  return undefined;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
