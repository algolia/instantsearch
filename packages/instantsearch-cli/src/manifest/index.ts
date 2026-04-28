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

export function readRootManifest(projectDir: string): RootManifest | null {
  const filePath = path.join(projectDir, ROOT_MANIFEST_FILENAME);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as RootManifest;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

export function writeRootManifest(
  projectDir: string,
  manifest: RootManifest | Record<string, unknown>
): void {
  const filePath = path.join(projectDir, ROOT_MANIFEST_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
}

export function readExperienceManifest(
  experienceDir: string
): ExperienceManifest | null {
  const filePath = path.join(experienceDir, EXPERIENCE_MANIFEST_FILENAME);
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as ExperienceManifest;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') {
      return null;
    }
    throw err;
  }
}

export function writeExperienceManifest(
  experienceDir: string,
  manifest: ExperienceManifest | Record<string, unknown>
): void {
  const filePath = path.join(experienceDir, EXPERIENCE_MANIFEST_FILENAME);
  fs.writeFileSync(filePath, JSON.stringify(manifest, null, 2) + '\n', 'utf8');
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
