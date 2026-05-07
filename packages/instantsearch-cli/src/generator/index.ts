import path from 'node:path';

import type { AlgoliaCredentials, Flavor, Framework } from '../types';
import type { ResolvedExperienceManifest } from '../manifest';
import type { GeneratorContext } from '../shared-types';
import {
  getGenerator,
  getSupportedWidgets,
  resolveBaseWidgetName,
  type WidgetName,
} from '../registry';
import {
  refinementListWidgetName,
  startFunctionName,
  experienceComponentName,
  widgetContainerId,
} from '../utils/naming';
import { jsString } from '../utils/codegen';

export type ResolvedManifest = {
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  algolia: AlgoliaCredentials;
};

export type GeneratedFiles = Map<string, string>;

export type { WidgetName };
export const SUPPORTED_WIDGETS: readonly WidgetName[] = getSupportedWidgets();

const DEFAULT_HITS_PER_PAGE = 20;
const ALGOLIA_CLIENT_PATH = 'src/lib/algolia-client';
const ALGOLIA_PROVIDER_PATH = 'src/lib/algolia-provider';

function algoliaClientSource({
  appId,
  searchApiKey,
}: AlgoliaCredentials): string {
  return `import { algoliasearch } from 'algoliasearch';

export const searchClient = algoliasearch(${jsString(appId)}, ${jsString(searchApiKey)});
`;
}

function reactSharedProviderSource(manifest: ResolvedManifest): string {
  const typeImport = manifest.typescript
    ? `import type { ReactNode } from 'react';\n`
    : '';
  const paramAnnotation = manifest.typescript
    ? ': { children: ReactNode }'
    : '';
  const { directive, componentImport, element } =
    manifest.framework === 'nextjs'
      ? {
          directive: `'use client';\n\n`,
          componentImport: `import { InstantSearchNext } from 'react-instantsearch-nextjs';`,
          element: 'InstantSearchNext',
        }
      : {
          directive: '',
          componentImport: `import { InstantSearch } from 'react-instantsearch';`,
          element: 'InstantSearch',
        };

  return `${directive}${typeImport}${componentImport}

import { searchClient } from './algolia-client';

export function AlgoliaProvider({ children }${paramAnnotation}) {
  return (
    <${element} searchClient={searchClient}>
      {children}
    </${element}>
  );
}
`;
}

function jsSharedProviderSource(): string {
  return `import instantsearch from 'instantsearch.js';

import { searchClient } from './algolia-client';

export const search = instantsearch({ searchClient });
`;
}

function fileExtension(manifest: { flavor: Flavor; typescript: boolean }): string {
  if (manifest.flavor === 'js') {
    return manifest.typescript ? 'ts' : 'js';
  }
  return manifest.typescript ? 'tsx' : 'jsx';
}

export function generate(manifest: ResolvedManifest): GeneratedFiles {
  const files: GeneratedFiles = new Map();
  const ext = manifest.typescript ? 'ts' : 'js';
  files.set(
    `${ALGOLIA_CLIENT_PATH}.${ext}`,
    algoliaClientSource(manifest.algolia)
  );
  const providerExt = fileExtension(manifest);
  const providerSource = manifest.flavor === 'js'
    ? jsSharedProviderSource()
    : reactSharedProviderSource(manifest);
  files.set(
    `${ALGOLIA_PROVIDER_PATH}.${providerExt}`,
    providerSource
  );
  return files;
}

type ExperienceSchema = NonNullable<
  ResolvedExperienceManifest['experience']['schema']
>;

function findRefinementListAttribute(
  schemaList: ExperienceSchema['refinementList'],
  widgetName: string
): string {
  if (!schemaList || schemaList.length === 0) {
    throw new Error(
      'RefinementList widget requires schema.refinementList. Pass --refinement-list-attribute <attr>.'
    );
  }
  if (widgetName === 'RefinementList') {
    return schemaList[0].attribute;
  }
  const match = schemaList.find(
    (entry) => refinementListWidgetName(entry.attribute) === widgetName
  );
  if (!match) {
    throw new Error(
      `No schema entry found for RefinementList widget '${widgetName}'.`
    );
  }
  return match.attribute;
}

function buildGeneratorContext(
  widgetName: string,
  baseWidgetName: string,
  manifest: ResolvedExperienceManifest
): GeneratorContext {
  const schema = manifest.experience.schema ?? {};
  const params: Record<string, unknown> = {};
  const introspection: Record<string, unknown> = {};

  if (baseWidgetName === 'Hits' && schema.hits) {
    introspection.title = schema.hits.title;
    if (schema.hits.image) introspection.image = schema.hits.image;
    if (schema.hits.description)
      introspection.description = schema.hits.description;
  }

  if (baseWidgetName === 'RefinementList') {
    params.attribute = findRefinementListAttribute(
      schema.refinementList,
      widgetName
    );
  }

  if (baseWidgetName === 'SortBy') {
    if (!schema.sortBy || schema.sortBy.replicas.length === 0) {
      throw new Error(
        'SortBy widget requires schema.sortBy.replicas. Pass --sort-by-replicas <comma-list>.'
      );
    }
    params.indexName = manifest.experience.indexName;
    params.replicas = schema.sortBy.replicas;
  }

  return {
    widgetName,
    typescript: manifest.typescript,
    params,
    introspection,
  };
}

function widgetSource(
  widgetName: string,
  manifest: ResolvedExperienceManifest
): string {
  const baseName = resolveBaseWidgetName(widgetName);
  if (!baseName) throw new Error(`Unknown widget: ${widgetName}`);

  const generator = getGenerator(baseName, manifest.flavor);
  if (!generator) {
    throw new Error(
      `No generator found for widget '${baseName}' in flavor '${manifest.flavor}'.`
    );
  }

  const ctx = buildGeneratorContext(widgetName, baseName, manifest);
  const result = generator.generate(ctx);
  return result.code;
}

function widgetExtension(manifest: ResolvedExperienceManifest): string {
  return fileExtension(manifest);
}

export function widgetFilePath(
  manifest: ResolvedExperienceManifest,
  widget: string,
  fileName?: string
): string {
  const experienceDir = path.posix.join(
    manifest.componentsPath,
    manifest.experience.name
  );
  return path.posix.join(
    experienceDir,
    `${fileName ?? widget}.${widgetExtension(manifest)}`
  );
}

export function generateWidget(
  manifest: ResolvedExperienceManifest,
  params: { widget: string; fileName?: string }
): GeneratedFiles {
  return new Map([
    [
      widgetFilePath(manifest, params.widget, params.fileName),
      widgetSource(params.widget, manifest),
    ],
  ]);
}

function reactIndexSource(manifest: ResolvedExperienceManifest): string {
  const componentName = experienceComponentName(manifest.experience.name);
  const widgets = manifest.experience.widgets;
  const indexName = manifest.experience.indexName;

  const imports = [
    `import { Configure, Index } from 'react-instantsearch';`,
    ...widgets.map((w) => `import { ${w} } from ${jsString(`./${w}`)};`),
  ].join('\n');

  const widgetElements = widgets.map((w) => `      <${w} />`).join('\n');
  const directive =
    manifest.framework === 'nextjs' ? `'use client';\n\n` : '';

  return `${directive}${imports}

export function ${componentName}() {
  return (
    <Index indexName={${jsString(indexName)}}>
      <Configure hitsPerPage={20} />
${widgetElements}
    </Index>
  );
}
`;
}

function jsIndexSource(manifest: ResolvedExperienceManifest): string {
  const startName = startFunctionName(manifest.experience.name);
  const widgets = manifest.experience.widgets;

  const imports = [
    `import { configure } from 'instantsearch.js/es/widgets';`,
    `import { ${startName} } from ${jsString('./provider')};`,
    ...widgets.map((w) => `import { ${w} } from ${jsString(`./${w}`)};`),
  ].join('\n');

  const widgetCalls = [
    `  configure({ hitsPerPage: ${DEFAULT_HITS_PER_PAGE} })`,
    ...widgets.map((w) => `  ${w}(${jsString(`#${widgetContainerId(w)}`)})`)
  ].join(',\n');

  return `${imports}

${startName}([
${widgetCalls},
]);
`;
}

export function generateExperience(
  manifest: ResolvedExperienceManifest
): GeneratedFiles {
  const files: GeneratedFiles = new Map();
  const experienceDir = path.posix.join(
    manifest.componentsPath,
    manifest.experience.name
  );
  const ext = widgetExtension(manifest);

  for (const widget of manifest.experience.widgets) {
    files.set(
      path.posix.join(experienceDir, `${widget}.${ext}`),
      widgetSource(widget, manifest)
    );
  }

  const indexSource =
    manifest.flavor === 'js'
      ? jsIndexSource(manifest)
      : reactIndexSource(manifest);
  files.set(path.posix.join(experienceDir, `index.${ext}`), indexSource);

  return files;
}
