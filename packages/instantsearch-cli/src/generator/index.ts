import path from 'node:path';

import type { AlgoliaCredentials, Flavor, Framework } from '../types';
import type { ResolvedExperienceManifest } from '../manifest';
import {
  refinementListWidgetName,
  providerComponentName,
  startFunctionName,
  experienceComponentName,
  widgetContainerId,
} from '../utils/naming';

export type ResolvedManifest = {
  flavor: Flavor;
  framework: Framework | null;
  typescript: boolean;
  algolia: AlgoliaCredentials;
};

export type GeneratedFiles = Map<string, string>;

const ALGOLIA_CLIENT_PATH = 'src/lib/algolia-client';

function algoliaClientSource({
  appId,
  searchApiKey,
}: AlgoliaCredentials): string {
  return `import { algoliasearch } from 'algoliasearch';

export const searchClient = algoliasearch('${appId}', '${searchApiKey}');
`;
}

export function generate(manifest: ResolvedManifest): GeneratedFiles {
  const files: GeneratedFiles = new Map();
  const ext = manifest.typescript ? 'ts' : 'js';
  files.set(
    `${ALGOLIA_CLIENT_PATH}.${ext}`,
    algoliaClientSource(manifest.algolia)
  );
  return files;
}

function clientImportSpecifier(experienceDir: string): string {
  const specifier = path.posix.relative(experienceDir, ALGOLIA_CLIENT_PATH);
  return specifier.startsWith('.') ? specifier : `./${specifier}`;
}

function reactProviderSource(
  manifest: ResolvedExperienceManifest,
  experienceDir: string
): string {
  const componentName = providerComponentName(manifest.experience.name);
  const clientImport = clientImportSpecifier(experienceDir);
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

import { searchClient } from '${clientImport}';

export function ${componentName}({ children }${paramAnnotation}) {
  return (
    <${element} searchClient={searchClient} indexName="${manifest.experience.indexName}">
      {children}
    </${element}>
  );
}
`;
}

function jsProviderSource(
  manifest: ResolvedExperienceManifest,
  experienceDir: string
): string {
  const startName = startFunctionName(manifest.experience.name);
  const clientImport = clientImportSpecifier(experienceDir);

  return `import instantsearch from 'instantsearch.js';

import { searchClient } from '${clientImport}';

export function ${startName}(widgets) {
  const search = instantsearch({
    indexName: '${manifest.experience.indexName}',
    searchClient,
  });
  search.addWidgets(widgets);
  search.start();
  return search;
}
`;
}

const STRUCTURAL_WIDGETS = [
  'SearchBox',
  'Pagination',
  'ClearRefinements',
] as const;
type StructuralWidget = typeof STRUCTURAL_WIDGETS[number];

const SCHEMA_WIDGETS = ['Hits', 'RefinementList', 'SortBy'] as const;
type SchemaWidget = typeof SCHEMA_WIDGETS[number];

export type WidgetName = StructuralWidget | SchemaWidget;

export const SUPPORTED_WIDGETS: readonly WidgetName[] = [
  ...STRUCTURAL_WIDGETS,
  ...SCHEMA_WIDGETS,
];

const JS_WIDGET_FACTORY: Record<StructuralWidget | SchemaWidget, string> = {
  SearchBox: 'searchBox',
  Pagination: 'pagination',
  ClearRefinements: 'clearRefinements',
  Hits: 'hits',
  RefinementList: 'refinementList',
  SortBy: 'sortBy',
};

function structuralWidgetSource(widget: StructuralWidget): string {
  return `import { ${widget} as InstantSearch${widget} } from 'react-instantsearch';

export function ${widget}() {
  return <InstantSearch${widget} />;
}
`;
}

function jsStructuralWidgetSource(widget: StructuralWidget): string {
  const factory = JS_WIDGET_FACTORY[widget];
  return `import { ${factory} } from 'instantsearch.js/es/widgets';

export function ${widget}(container) {
  return ${factory}({ container });
}
`;
}

function isStructuralWidget(widget: string): widget is StructuralWidget {
  return (STRUCTURAL_WIDGETS as readonly string[]).includes(widget);
}

function isSchemaWidget(widget: string): widget is SchemaWidget {
  return (SCHEMA_WIDGETS as readonly string[]).includes(widget);
}

type ExperienceSchema = NonNullable<
  ResolvedExperienceManifest['experience']['schema']
>;
type HitsSchema = NonNullable<ExperienceSchema['hits']>;
type RefinementListSchema = { attribute: string };
type SortBySchema = NonNullable<ExperienceSchema['sortBy']>;

function requireHitsSchema(schema: ExperienceSchema['hits']): HitsSchema {
  if (!schema?.title) {
    throw new Error(
      'Hits widget requires schema.hits.title. Pass --hits-title <attr>.'
    );
  }
  return schema;
}

function findRefinementListSchema(
  schemaList: ExperienceSchema['refinementList'],
  widgetName: string
): RefinementListSchema {
  if (!schemaList || schemaList.length === 0) {
    throw new Error(
      'RefinementList widget requires schema.refinementList. Pass --refinement-list-attribute <attr>.'
    );
  }
  if (widgetName === 'RefinementList') {
    return schemaList[0];
  }
  const match = schemaList.find(
    (entry) => refinementListWidgetName(entry.attribute) === widgetName
  );
  if (!match) {
    throw new Error(
      `No schema entry found for RefinementList widget '${widgetName}'.`
    );
  }
  return match;
}

function requireSortBySchema(schema: ExperienceSchema['sortBy']): SortBySchema {
  if (!schema || schema.replicas.length === 0) {
    throw new Error(
      'SortBy widget requires schema.sortBy.replicas. Pass --sort-by-replicas <comma-list>.'
    );
  }
  return schema;
}

function hitsSource(
  schemaInput: ExperienceSchema['hits'],
  typescript: boolean
): string {
  const { title, image, description } = requireHitsSchema(schemaInput);

  const body = [
    image ? `      <img src={hit.${image}} alt={hit.${title}} />` : '',
    `      <h3>{hit.${title}}</h3>`,
    description ? `      <p>{hit.${description}}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const recordFields = [
    `  ${title}: string;`,
    image ? `  ${image}: string;` : '',
    description ? `  ${description}: string;` : '',
  ]
    .filter(Boolean)
    .join('\n');
  const typeBlock = typescript
    ? `type HitRecord = {\n${recordFields}\n};\n\n`
    : '';
  const hitAnnotation = typescript ? ': { hit: HitRecord }' : '';
  const hitsGeneric = typescript ? '<HitRecord>' : '';

  return `import { Hits as InstantSearchHits } from 'react-instantsearch';

${typeBlock}function Hit({ hit }${hitAnnotation}) {
  return (
    <article>
${body}
    </article>
  );
}

export function Hits() {
  return <InstantSearchHits${hitsGeneric} hitComponent={Hit} />;
}
`;
}

function refinementListSource(
  schemaInput: ExperienceSchema['refinementList'],
  widgetName: string
): string {
  const { attribute } = findRefinementListSchema(schemaInput, widgetName);
  return `import { RefinementList as InstantSearchRefinementList } from 'react-instantsearch';

export function ${widgetName}() {
  return <InstantSearchRefinementList attribute="${attribute}" />;
}
`;
}

function sortByItem(value: string, label: string): string {
  return `  { value: '${value}', label: '${label}' }`;
}

function replicaLabel(replica: string, indexName: string): string {
  const suffix = replica.startsWith(`${indexName}_`)
    ? replica.slice(indexName.length + 1)
    : replica;
  return suffix.replace(/_/g, ' ');
}

function sortByItems(indexName: string, replicas: readonly string[]): string {
  return [
    sortByItem(indexName, 'Featured'),
    ...replicas.map((replica) =>
      sortByItem(replica, replicaLabel(replica, indexName))
    ),
  ].join(',\n');
}

function sortBySource(
  indexName: string,
  schemaInput: ExperienceSchema['sortBy']
): string {
  const { replicas } = requireSortBySchema(schemaInput);
  return `import { SortBy as InstantSearchSortBy } from 'react-instantsearch';

const items = [
${sortByItems(indexName, replicas)},
];

export function SortBy() {
  return <InstantSearchSortBy items={items} />;
}
`;
}

function schemaWidgetSource(
  widget: SchemaWidget,
  manifest: ResolvedExperienceManifest,
  widgetName: string
): string {
  const schema = manifest.experience.schema ?? {};
  if (widget === 'Hits') return hitsSource(schema.hits, manifest.typescript);
  if (widget === 'RefinementList')
    return refinementListSource(schema.refinementList, widgetName);
  return sortBySource(manifest.experience.indexName, schema.sortBy);
}

function jsHitsSource(schemaInput: ExperienceSchema['hits']): string {
  const { title, image, description } = requireHitsSchema(schemaInput);
  const lines = [
    image
      ? `          <img src="\${hit.${image}}" alt="\${hit.${title}}" />`
      : '',
    `          <h3>\${hit.${title}}</h3>`,
    description ? `          <p>\${hit.${description}}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `import { ${JS_WIDGET_FACTORY.Hits} } from 'instantsearch.js/es/widgets';

export function Hits(container) {
  return ${JS_WIDGET_FACTORY.Hits}({
    container,
    templates: {
      item: (hit, { html }) => html\`
        <article>
${lines}
        </article>
      \`,
    },
  });
}
`;
}

function jsRefinementListSource(
  schemaInput: ExperienceSchema['refinementList'],
  widgetName: string
): string {
  const { attribute } = findRefinementListSchema(schemaInput, widgetName);
  return `import { ${JS_WIDGET_FACTORY.RefinementList} } from 'instantsearch.js/es/widgets';

export function ${widgetName}(container) {
  return ${JS_WIDGET_FACTORY.RefinementList}({
    container,
    attribute: '${attribute}',
  });
}
`;
}

function jsSortBySource(
  indexName: string,
  schemaInput: ExperienceSchema['sortBy']
): string {
  const { replicas } = requireSortBySchema(schemaInput);
  return `import { ${
    JS_WIDGET_FACTORY.SortBy
  } } from 'instantsearch.js/es/widgets';

const items = [
${sortByItems(indexName, replicas)},
];

export function SortBy(container) {
  return ${JS_WIDGET_FACTORY.SortBy}({ container, items });
}
`;
}

function jsSchemaWidgetSource(
  widget: SchemaWidget,
  manifest: ResolvedExperienceManifest,
  widgetName: string
): string {
  const schema = manifest.experience.schema ?? {};
  if (widget === 'Hits') return jsHitsSource(schema.hits);
  if (widget === 'RefinementList')
    return jsRefinementListSource(schema.refinementList, widgetName);
  return jsSortBySource(manifest.experience.indexName, schema.sortBy);
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

function widgetExtension(manifest: ResolvedExperienceManifest): string {
  if (manifest.flavor === 'js') {
    return manifest.typescript ? 'ts' : 'js';
  }
  return manifest.typescript ? 'tsx' : 'jsx';
}

type FlavorSources = {
  provider: (
    manifest: ResolvedExperienceManifest,
    experienceDir: string
  ) => string;
  structural: (widget: StructuralWidget) => string;
  schema: (
    widget: SchemaWidget,
    manifest: ResolvedExperienceManifest,
    widgetName: string
  ) => string;
};

const SOURCES_BY_FLAVOR: Record<Flavor, FlavorSources> = {
  react: {
    provider: reactProviderSource,
    structural: structuralWidgetSource,
    schema: schemaWidgetSource,
  },
  js: {
    provider: jsProviderSource,
    structural: jsStructuralWidgetSource,
    schema: jsSchemaWidgetSource,
  },
};

function baseWidgetName(widget: string): WidgetName | null {
  if (isStructuralWidget(widget)) return widget;
  if (isSchemaWidget(widget)) return widget;
  if (/^RefinementList[A-Z]/.test(widget)) return 'RefinementList';
  return null;
}

function widgetSource(
  widgetName: string,
  manifest: ResolvedExperienceManifest
): string {
  const sources = SOURCES_BY_FLAVOR[manifest.flavor];
  const base = baseWidgetName(widgetName);
  if (!base) throw new Error(`Unknown widget: ${widgetName}`);
  if (isStructuralWidget(base)) return sources.structural(base);
  return sources.schema(base, manifest, widgetName);
}

export function widgetFilePath(
  manifest: ResolvedExperienceManifest,
  widget: WidgetName,
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
  params: { widget: WidgetName; fileName?: string }
): GeneratedFiles {
  return new Map([
    [
      widgetFilePath(manifest, params.widget, params.fileName),
      widgetSource(params.widget, manifest),
    ],
  ]);
}

function assertKnownWidget(widget: string): void {
  if (!baseWidgetName(widget)) {
    throw new Error(`Unknown widget: ${widget}`);
  }
}

function reactIndexSource(manifest: ResolvedExperienceManifest): string {
  const componentName = experienceComponentName(manifest.experience.name);
  const providerName = providerComponentName(manifest.experience.name);
  const widgets = manifest.experience.widgets;

  const imports = [
    `import { ${providerName} } from './provider';`,
    ...widgets.map((w) => `import { ${w} } from './${w}';`),
  ].join('\n');

  const widgetElements = widgets.map((w) => `      <${w} />`).join('\n');
  const directive =
    manifest.framework === 'nextjs' ? `'use client';\n\n` : '';

  return `${directive}${imports}

export function ${componentName}() {
  return (
    <${providerName}>
${widgetElements}
    </${providerName}>
  );
}
`;
}

function jsIndexSource(manifest: ResolvedExperienceManifest): string {
  const startName = startFunctionName(manifest.experience.name);
  const widgets = manifest.experience.widgets;

  const imports = [
    `import { ${startName} } from './provider';`,
    ...widgets.map((w) => `import { ${w} } from './${w}';`),
  ].join('\n');

  const widgetCalls = widgets
    .map((w) => `  ${w}('#${widgetContainerId(w)}')`)
    .join(',\n');

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
  const sources = SOURCES_BY_FLAVOR[manifest.flavor];

  files.set(
    path.posix.join(experienceDir, 'instantsearch.config.json'),
    experienceConfigSource(manifest)
  );
  files.set(
    path.posix.join(experienceDir, `provider.${ext}`),
    sources.provider(manifest, experienceDir)
  );

  for (const widget of manifest.experience.widgets) {
    assertKnownWidget(widget);
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
