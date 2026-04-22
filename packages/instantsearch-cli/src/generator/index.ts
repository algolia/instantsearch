import type { AlgoliaCredentials, Flavor, Framework } from '../types';

export type ResolvedManifest = {
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  algolia: AlgoliaCredentials;
};

export type GeneratedFiles = Map<string, string>;

function algoliaClientSource({ appId, searchApiKey }: AlgoliaCredentials): string {
  return `import { algoliasearch } from 'algoliasearch';

export const searchClient = algoliasearch('${appId}', '${searchApiKey}');
`;
}

export function generate(manifest: ResolvedManifest): GeneratedFiles {
  const files: GeneratedFiles = new Map();
  const ext = manifest.typescript ? 'ts' : 'js';
  files.set(`src/lib/algolia-client.${ext}`, algoliaClientSource(manifest.algolia));
  return files;
}
