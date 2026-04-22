import fs from 'node:fs';
import path from 'node:path';

import type { AlgoliaCredentials, Flavor, Framework } from '../types';

export const ROOT_MANIFEST_FILENAME = 'instantsearch.json';

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
