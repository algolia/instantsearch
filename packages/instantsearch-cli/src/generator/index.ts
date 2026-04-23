import path from 'node:path';

import type { AlgoliaCredentials, Flavor, Framework } from '../types';
import type { ResolvedExperienceManifest } from '../manifest';
import { providerComponentName } from '../utils/naming';

export type ResolvedManifest = {
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  algolia: AlgoliaCredentials;
};

export type GeneratedFiles = Map<string, string>;

const ALGOLIA_CLIENT_PATH = 'src/lib/algolia-client';

function algoliaClientSource({ appId, searchApiKey }: AlgoliaCredentials): string {
  return `import { algoliasearch } from 'algoliasearch';

export const searchClient = algoliasearch('${appId}', '${searchApiKey}');
`;
}

export function generate(manifest: ResolvedManifest): GeneratedFiles {
  const files: GeneratedFiles = new Map();
  const ext = manifest.typescript ? 'ts' : 'js';
  files.set(`${ALGOLIA_CLIENT_PATH}.${ext}`, algoliaClientSource(manifest.algolia));
  return files;
}

function clientImportSpecifier(experienceDir: string): string {
  const specifier = path.posix.relative(experienceDir, ALGOLIA_CLIENT_PATH);
  return specifier.startsWith('.') ? specifier : `./${specifier}`;
}

function providerSource(
  manifest: ResolvedExperienceManifest,
  experienceDir: string
): string {
  const componentName = providerComponentName(manifest.experience.name);
  const clientImport = clientImportSpecifier(experienceDir);
  return `import type { ReactNode } from 'react';
import { InstantSearch } from 'react-instantsearch';

import { searchClient } from '${clientImport}';

export function ${componentName}({ children }: { children: ReactNode }) {
  return (
    <InstantSearch searchClient={searchClient} indexName="${manifest.experience.indexName}">
      {children}
    </InstantSearch>
  );
}
`;
}

const STRUCTURAL_WIDGETS = ['SearchBox', 'Pagination', 'ClearRefinements'] as const;
type StructuralWidget = (typeof STRUCTURAL_WIDGETS)[number];

function structuralWidgetSource(widget: StructuralWidget): string {
  return `import { ${widget} as InstantSearch${widget} } from 'react-instantsearch';

export function ${widget}() {
  return <InstantSearch${widget} />;
}
`;
}

function isStructuralWidget(widget: string): widget is StructuralWidget {
  return (STRUCTURAL_WIDGETS as readonly string[]).includes(widget);
}

function experienceConfigSource(manifest: ResolvedExperienceManifest): string {
  return (
    JSON.stringify(
      {
        apiVersion: 1,
        indexName: manifest.experience.indexName,
        widgets: manifest.experience.widgets,
      },
      null,
      2
    ) + '\n'
  );
}

export function generateExperience(
  manifest: ResolvedExperienceManifest
): GeneratedFiles {
  const files: GeneratedFiles = new Map();
  const experienceDir = path.posix.join(
    manifest.componentsPath,
    manifest.experience.name
  );
  const ext = manifest.typescript ? 'tsx' : 'jsx';

  files.set(
    path.posix.join(experienceDir, 'instantsearch.config.json'),
    experienceConfigSource(manifest)
  );
  files.set(
    path.posix.join(experienceDir, `provider.${ext}`),
    providerSource(manifest, experienceDir)
  );

  for (const widget of manifest.experience.widgets) {
    if (!isStructuralWidget(widget)) {
      throw new Error(`Unknown widget: ${widget}`);
    }
    files.set(
      path.posix.join(experienceDir, `${widget}.${ext}`),
      structuralWidgetSource(widget)
    );
  }

  return files;
}
