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

const SCHEMA_WIDGETS = ['Hits', 'RefinementList', 'SortBy'] as const;
type SchemaWidget = (typeof SCHEMA_WIDGETS)[number];

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

function isSchemaWidget(widget: string): widget is SchemaWidget {
  return (SCHEMA_WIDGETS as readonly string[]).includes(widget);
}

function hitsSource(
  schema: NonNullable<ResolvedExperienceManifest['experience']['schema']>['hits']
): string {
  if (!schema?.title) {
    throw new Error(
      "Hits widget requires schema.hits.title. Pass --hits-title <attr>."
    );
  }
  const { title, image, description } = schema;
  const recordFields = [
    `  ${title}: string;`,
    image ? `  ${image}: string;` : '',
    description ? `  ${description}: string;` : '',
  ]
    .filter(Boolean)
    .join('\n');

  const body = [
    image ? `      <img src={hit.${image}} alt={hit.${title}} />` : '',
    `      <h3>{hit.${title}}</h3>`,
    description ? `      <p>{hit.${description}}</p>` : '',
  ]
    .filter(Boolean)
    .join('\n');

  return `import { Hits as InstantSearchHits } from 'react-instantsearch';

type HitRecord = {
${recordFields}
};

function Hit({ hit }: { hit: HitRecord }) {
  return (
    <article>
${body}
    </article>
  );
}

export function Hits() {
  return <InstantSearchHits<HitRecord> hitComponent={Hit} />;
}
`;
}

function refinementListSource(
  schema: NonNullable<
    ResolvedExperienceManifest['experience']['schema']
  >['refinementList']
): string {
  if (!schema?.attribute) {
    throw new Error(
      'RefinementList widget requires schema.refinementList.attribute. Pass --refinement-list-attribute <attr>.'
    );
  }
  return `import { RefinementList as InstantSearchRefinementList } from 'react-instantsearch';

export function RefinementList() {
  return <InstantSearchRefinementList attribute="${schema.attribute}" />;
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

function sortBySource(
  indexName: string,
  schema: NonNullable<
    ResolvedExperienceManifest['experience']['schema']
  >['sortBy']
): string {
  if (!schema || schema.replicas.length === 0) {
    throw new Error(
      'SortBy widget requires schema.sortBy.replicas. Pass --sort-by-replicas <comma-list>.'
    );
  }
  const items = [
    sortByItem(indexName, 'Featured'),
    ...schema.replicas.map((replica) =>
      sortByItem(replica, replicaLabel(replica, indexName))
    ),
  ].join(',\n');

  return `import { SortBy as InstantSearchSortBy } from 'react-instantsearch';

const items = [
${items},
];

export function SortBy() {
  return <InstantSearchSortBy items={items} />;
}
`;
}

function schemaWidgetSource(
  widget: SchemaWidget,
  manifest: ResolvedExperienceManifest
): string {
  const schema = manifest.experience.schema ?? {};
  if (widget === 'Hits') return hitsSource(schema.hits);
  if (widget === 'RefinementList') return refinementListSource(schema.refinementList);
  return sortBySource(manifest.experience.indexName, schema.sortBy);
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
    const filePath = path.posix.join(experienceDir, `${widget}.${ext}`);
    if (isStructuralWidget(widget)) {
      files.set(filePath, structuralWidgetSource(widget));
      continue;
    }
    if (isSchemaWidget(widget)) {
      files.set(filePath, schemaWidgetSource(widget, manifest));
      continue;
    }
    throw new Error(`Unknown widget: ${widget}`);
  }

  return files;
}
