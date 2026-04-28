import fs from 'node:fs';
import path from 'node:path';

import type { AlgoliaCredentials, Flavor, Framework } from '../types';

export const ROOT_MANIFEST_FILENAME = 'instantsearch.json';
export const EXPERIENCE_MANIFEST_FILENAME = 'instantsearch.config.json';

export type RootManifest = {
  apiVersion: 1;
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  componentsPath: string;
  aliases: Record<string, string>;
  algolia: AlgoliaCredentials;
  experiences: Array<{ name: string; path: string }>;
};

export type ExperienceSchema = {
  hits?: { title: string; image?: string; description?: string };
  refinementList?: Array<{ attribute: string }>;
  sortBy?: { replicas: string[] };
};

export type ExperienceManifest = {
  apiVersion: 1;
  indexName: string;
  widgets: string[];
  schema?: ExperienceSchema;
};

export type ManifestReadResult<T> =
  | { ok: true; manifest: T }
  | { ok: false; code: 'not_found' | 'invalid_manifest'; message: string };

export function readRootManifest(projectDir: string): RootManifest | null {
  const result = readRootManifestResult(projectDir);
  if (result.ok) return result.manifest;
  if (result.code === 'not_found') return null;
  throw new Error(result.message);
}

export function readRootManifestResult(
  projectDir: string
): ManifestReadResult<RootManifest> {
  const filePath = path.join(projectDir, ROOT_MANIFEST_FILENAME);
  return readManifest(filePath, ROOT_MANIFEST_FILENAME, isRootManifest);
}

export function writeRootManifest(
  projectDir: string,
  manifest: RootManifest | Record<string, unknown>
): void {
  const filePath = path.join(projectDir, ROOT_MANIFEST_FILENAME);
  fs.writeFileSync(filePath, serializeManifest(manifest), 'utf8');
}

export function readExperienceManifest(
  experienceDir: string
): ExperienceManifest | null {
  const result = readExperienceManifestResult(experienceDir);
  if (result.ok) return result.manifest;
  if (result.code === 'not_found') return null;
  throw new Error(result.message);
}

export function readExperienceManifestResult(
  experienceDir: string
): ManifestReadResult<ExperienceManifest> {
  const filePath = path.join(experienceDir, EXPERIENCE_MANIFEST_FILENAME);
  return readManifest(
    filePath,
    EXPERIENCE_MANIFEST_FILENAME,
    isExperienceManifest
  );
}

function readManifest<T>(
  filePath: string,
  label: string,
  validate: (value: unknown) => value is T
): ManifestReadResult<T> {
  try {
    const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8')) as unknown;
    if (!validate(parsed)) {
      return {
        ok: false,
        code: 'invalid_manifest',
        message: `${label} is not a valid InstantSearch manifest.`,
      };
    }
    return { ok: true, manifest: parsed };
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return {
        ok: false,
        code: 'not_found',
        message: `${label} was not found.`,
      };
    }
    if (err instanceof SyntaxError) {
      return {
        ok: false,
        code: 'invalid_manifest',
        message: `${label} contains invalid JSON.`,
      };
    }
    throw err;
  }
}

export function writeExperienceManifest(
  experienceDir: string,
  manifest: ExperienceManifest | Record<string, unknown>
): void {
  const filePath = path.join(experienceDir, EXPERIENCE_MANIFEST_FILENAME);
  fs.writeFileSync(filePath, serializeManifest(manifest), 'utf8');
}

export function serializeManifest(
  manifest: RootManifest | ExperienceManifest | Record<string, unknown>
): string {
  return JSON.stringify(manifest, null, 2) + '\n';
}

export function addExperienceToRoot(
  projectDir: string,
  manifest: RootManifest,
  entry: { name: string; path: string }
): void {
  manifest.experiences = [...manifest.experiences, entry];
  writeRootManifest(projectDir, manifest);
}

export type ResolvedExperienceManifest = {
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  componentsPath: string;
  aliases: Record<string, string>;
  algolia: AlgoliaCredentials;
  experience: {
    name: string;
    indexName: string;
    widgets: string[];
    schema?: ExperienceSchema;
  };
};

export function resolveExperience(
  root: RootManifest,
  params: { name: string; experience: ExperienceManifest }
): ResolvedExperienceManifest {
  return {
    flavor: root.flavor,
    framework: root.framework,
    typescript: root.typescript,
    componentsPath: root.componentsPath,
    aliases: root.aliases,
    algolia: root.algolia,
    experience: {
      name: params.name,
      indexName: params.experience.indexName,
      widgets: params.experience.widgets,
      schema: params.experience.schema,
    },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringRecord(value: unknown): value is Record<string, string> {
  return (
    isRecord(value) &&
    Object.values(value).every((entry) => typeof entry === 'string')
  );
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string');
}

function isRootManifest(value: unknown): value is RootManifest {
  if (!isRecord(value)) return false;
  const algolia = value.algolia;
  return (
    value.apiVersion === 1 &&
    (value.flavor === 'react' || value.flavor === 'js') &&
    (value.framework === null || value.framework === 'nextjs') &&
    typeof value.typescript === 'boolean' &&
    typeof value.componentsPath === 'string' &&
    isStringRecord(value.aliases) &&
    isRecord(algolia) &&
    typeof algolia.appId === 'string' &&
    typeof algolia.searchApiKey === 'string' &&
    Array.isArray(value.experiences) &&
    value.experiences.every(isExperienceEntry)
  );
}

function isExperienceEntry(value: unknown): value is { name: string; path: string } {
  return (
    isRecord(value) &&
    typeof value.name === 'string' &&
    typeof value.path === 'string'
  );
}

function isExperienceManifest(value: unknown): value is ExperienceManifest {
  return (
    isRecord(value) &&
    value.apiVersion === 1 &&
    typeof value.indexName === 'string' &&
    isStringArray(value.widgets) &&
    (value.schema === undefined || isExperienceSchema(value.schema))
  );
}

function isExperienceSchema(value: unknown): value is ExperienceSchema {
  if (!isRecord(value)) return false;
  return (
    (value.hits === undefined || isHitsSchema(value.hits)) &&
    (value.refinementList === undefined ||
      (Array.isArray(value.refinementList) &&
        value.refinementList.every(isRefinementListSchema))) &&
    (value.sortBy === undefined || isSortBySchema(value.sortBy))
  );
}

function isHitsSchema(value: unknown): value is NonNullable<ExperienceSchema['hits']> {
  return (
    isRecord(value) &&
    typeof value.title === 'string' &&
    (value.image === undefined || typeof value.image === 'string') &&
    (value.description === undefined || typeof value.description === 'string')
  );
}

function isRefinementListSchema(
  value: unknown
): value is NonNullable<ExperienceSchema['refinementList']>[number] {
  return isRecord(value) && typeof value.attribute === 'string';
}

function isSortBySchema(value: unknown): value is NonNullable<ExperienceSchema['sortBy']> {
  return isRecord(value) && isStringArray(value.replicas);
}
