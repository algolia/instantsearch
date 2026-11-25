import path from 'path';

import { readProjectCredentials } from './credentials';
import { failureEnvelope, formatEnvelope, successEnvelope } from './envelope';
import { readManifest } from './manifest';
import { npxCommand } from './program-name';

import type { IO } from './io';

const COMMAND = 'introspect';
const MANIFEST_FILENAME = 'instantsearch.json';
const MAX_REFINEMENT_LISTS = 6;

type Hit = Record<string, unknown> & {
  _highlightResult?: Record<string, unknown>;
};

export type SearchResponse = {
  nbHits?: number;
  hits?: Hit[];
  facets?: Record<string, Record<string, number>>;
  facets_stats?: Record<string, { min: number; max: number }>;
  renderingContent?: { facetOrdering?: { facets?: { order?: string[] } } };
};

export type SearchFn = (
  credentials: { appId: string; searchApiKey: string },
  request: { indexName: string; hitsPerPage: number; withFacets: boolean }
) => Promise<SearchResponse>;

export type IntrospectOptions = {
  cwd: string;
  json: boolean;
  index?: string;
  appId?: string;
  searchApiKey?: string;
  env?: Record<string, string | undefined>;
  search?: SearchFn;
};

export type WidgetSuggestion = {
  widget: string;
  attribute?: string;
  attributes?: string[];
  index?: string;
  searchable?: boolean;
  reason: string;
};

export type IntrospectData = {
  indexName: string;
  nbHits: number;
  credentialsSource: string;
  searchableAttributes: string[];
  facets: string[];
  numericFacets: string[];
  displayAttributes: string[];
  imageAttributes: string[];
  querySuggestionsIndex: string | null;
  widgetPlan: WidgetSuggestion[];
  createInstantSearchAppCommand: string;
};

type ErrorCode = 'index_not_found' | 'credentials_invalid' | 'algolia_error';

const defaultSearch: SearchFn = async (
  { appId, searchApiKey },
  { indexName, hitsPerPage, withFacets }
) => {
  const { algoliasearch } = await import('algoliasearch');
  const client = algoliasearch(appId, searchApiKey);
  return (await client.searchSingleIndex({
    indexName,
    searchParams: {
      query: '',
      hitsPerPage,
      // Keep the index's default highlighting: it covers exactly the searchable
      // attributes, which is how they're inferred. '*' would highlight everything.
      ...(withFacets ? { facets: ['*'], maxValuesPerFacet: 100 } : {}),
    },
  })) as SearchResponse;
};

export async function runIntrospect(
  options: IntrospectOptions,
  io: IO
): Promise<number> {
  const credentials = resolveCredentials(options);
  if (!credentials.ok) {
    emitFailure(io, options.json, credentials.envelope);
    return 1;
  }

  const indexName = resolveIndexName(options);
  if (!indexName) {
    emitFailure(
      io,
      options.json,
      failureEnvelope(
        COMMAND,
        'missing_required_flag',
        '--index is required (or set ALGOLIA_INDEX_NAME in .env.local).'
      )
    );
    return 1;
  }

  const search = options.search ?? defaultSearch;
  let response: SearchResponse;
  try {
    response = await search(credentials.value, {
      indexName,
      hitsPerPage: 5,
      withFacets: true,
    });
  } catch (error) {
    const code = classifyAlgoliaError(error);
    const message =
      code === 'index_not_found'
        ? `Index "${indexName}" was not found.`
        : code === 'credentials_invalid'
          ? 'Algolia rejected the credentials. Check the application ID and search API key.'
          : describeError(error);
    emitFailure(io, options.json, failureEnvelope(COMMAND, code, message));
    return 1;
  }

  const querySuggestionsIndex = await findQuerySuggestionsIndex(
    search,
    credentials.value,
    indexName
  );
  const data = buildIntrospectData({
    indexName,
    response,
    querySuggestionsIndex,
    credentials: credentials.value,
    credentialsSource: credentials.source,
  });
  emitSuccess(io, options.json, data);
  return 0;
}

export function buildIntrospectData({
  indexName,
  response,
  querySuggestionsIndex,
  credentials,
  credentialsSource,
}: {
  indexName: string;
  response: SearchResponse;
  querySuggestionsIndex: string | null;
  credentials: { appId: string; searchApiKey: string };
  credentialsSource: string;
}): IntrospectData {
  const hits = response.hits ?? [];
  const facetValues = response.facets ?? {};
  const facets = Object.keys(facetValues);
  const numericFacets = Object.keys(response.facets_stats ?? {});
  const searchable = new Set<string>();
  for (const hit of hits) {
    for (const key of Object.keys(hit._highlightResult ?? {})) {
      searchable.add(key);
    }
  }
  const searchableAttributes = Array.from(searchable);
  const displayAttributes = orderDisplayAttributes(searchableAttributes);
  const imageAttributes = imageAttributeCandidates(hits);
  const widgetPlan = buildWidgetPlan({
    hits,
    facets,
    facetValues,
    numericFacets,
    facetOrder: response.renderingContent?.facetOrdering?.facets?.order ?? [],
    displayAttributes,
    imageAttributes,
    querySuggestionsIndex,
  });

  return {
    indexName,
    nbHits: response.nbHits ?? hits.length,
    credentialsSource,
    searchableAttributes,
    facets,
    numericFacets,
    displayAttributes,
    imageAttributes,
    querySuggestionsIndex,
    widgetPlan,
    createInstantSearchAppCommand: createInstantSearchAppCommand({
      credentials,
      indexName,
      displayAttributes,
      imageAttribute: imageAttributes[0],
      facets: widgetPlan
        .filter((suggestion) => suggestion.widget === 'RefinementList')
        .map((suggestion) => suggestion.attribute as string),
    }),
  };
}

/** Create InstantSearch App's ordering: title, name, and description first. */
export function orderDisplayAttributes(attributes: string[]): string[] {
  const preferred = ['title', 'name', 'description'].filter((name) =>
    attributes.includes(name)
  );
  return [
    ...preferred,
    ...attributes.filter((name) => !preferred.includes(name)),
  ];
}

/**
 * Create InstantSearch App's image heuristic: string values with no whitespace that
 * aren't highlighted (so not text) and aren't the objectID, image-like names first.
 */
export function imageAttributeCandidates(hits: Hit[]): string[] {
  const hit = hits[0];
  if (!hit) return [];
  const highlighted = new Set(Object.keys(hit._highlightResult ?? {}));
  const candidates = Object.entries(hit)
    .filter(
      ([key, value]) =>
        typeof value === 'string' &&
        !/\s/.test(value) &&
        key !== 'objectID' &&
        !key.startsWith('_') &&
        !highlighted.has(key)
    )
    .map(([key, value]) => ({
      key,
      score:
        (/image|img|thumbnail|picture|photo/i.test(key) ? 2 : 0) +
        (/^https?:\/\/|\.(png|jpe?g|webp|gif|avif|svg)(\?|$)/i.test(
          value as string
        )
          ? 1
          : 0),
    }));
  return candidates
    .filter((candidate) => candidate.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((candidate) => candidate.key);
}

const RANGE_ATTRIBUTE_RE =
  /price|rating|stars|year|amount|cost|size|weight|length|width|height|duration/i;

export function buildWidgetPlan({
  hits,
  facets,
  facetValues,
  numericFacets,
  facetOrder,
  displayAttributes,
  imageAttributes,
  querySuggestionsIndex,
}: {
  hits: Hit[];
  facets: string[];
  facetValues: Record<string, Record<string, number>>;
  numericFacets: string[];
  facetOrder: string[];
  displayAttributes: string[];
  imageAttributes: string[];
  querySuggestionsIndex: string | null;
}): WidgetSuggestion[] {
  const plan: WidgetSuggestion[] = [];
  plan.push(
    querySuggestionsIndex
      ? {
          widget: 'Autocomplete',
          index: querySuggestionsIndex,
          reason: 'a Query Suggestions index exists for this index',
        }
      : { widget: 'SearchBox', reason: 'free-text search' }
  );
  if (facetOrder.length > 0) {
    plan.push({
      widget: 'DynamicWidgets',
      reason: `the index sets facet ordering in renderingContent (${facetOrder.join(', ')})`,
    });
  }

  const rank = (name: string) => {
    const base = name.replace(/\.lvl\d+$/, '.lvl0');
    const index = facetOrder.indexOf(base);
    return index === -1 ? facetOrder.length : index;
  };
  const ordered = [...facets].sort((a, b) => rank(a) - rank(b));

  const hierarchical = new Map<string, string[]>();
  for (const facet of ordered) {
    const match = /^(.+)\.lvl(\d+)$/.exec(facet);
    if (!match) continue;
    hierarchical.set(match[1], [...(hierarchical.get(match[1]) ?? []), facet]);
  }
  const used = new Set<string>();
  const refinements: WidgetSuggestion[] = [];
  for (const facet of ordered) {
    if (used.has(facet)) continue;
    const match = /^(.+)\.lvl(\d+)$/.exec(facet);
    if (match) {
      const levels = (hierarchical.get(match[1]) ?? []).sort();
      levels.forEach((level) => used.add(level));
      if (levels[0]?.endsWith('.lvl0')) {
        refinements.push({
          widget: 'HierarchicalMenu',
          attributes: levels,
          reason: `${levels.length}-level category tree`,
        });
      }
      continue;
    }
    used.add(facet);
    const values = Object.keys(facetValues[facet] ?? {});
    if (numericFacets.includes(facet)) {
      if (RANGE_ATTRIBUTE_RE.test(facet)) {
        refinements.push({
          widget: 'RangeInput',
          attribute: facet,
          reason: 'numeric facet',
        });
      }
      continue;
    }
    if (
      values.length > 0 &&
      values.every((v) => v === 'true' || v === 'false')
    ) {
      refinements.push({
        widget: 'ToggleRefinement',
        attribute: facet,
        reason: 'boolean facet',
      });
      continue;
    }
    refinements.push({
      widget: 'RefinementList',
      attribute: facet,
      searchable: values.length >= 20,
      reason: `${values.length >= 100 ? '100+' : values.length} distinct values`,
    });
  }

  let refinementLists = 0;
  for (const suggestion of refinements) {
    if (suggestion.widget === 'RefinementList') {
      refinementLists += 1;
      if (refinementLists > MAX_REFINEMENT_LISTS) continue;
    }
    plan.push(suggestion);
  }
  if (refinements.length > 0) {
    plan.push({
      widget: 'CurrentRefinements',
      reason: 'show active filters with a way to remove them',
    });
  }
  if (hits.some((hit) => hit._geoloc !== undefined)) {
    plan.push({ widget: 'GeoSearch', reason: 'records have _geoloc' });
  }

  const priceAttribute = Object.keys(hits[0] ?? {}).find(
    (key) => /price|amount|cost/i.test(key) && typeof hits[0][key] === 'number'
  );
  plan.push({
    widget: 'Hits',
    attributes: [
      displayAttributes[0],
      imageAttributes[0],
      priceAttribute,
    ].filter((value): value is string => Boolean(value)),
    reason: 'card fields from sample records: title, image, price',
  });
  plan.push({ widget: 'Pagination', reason: 'continue past the first page' });
  plan.push({
    widget: 'insights',
    reason:
      'set the insights option on the InstantSearch provider for click and conversion events',
  });
  return plan;
}

function createInstantSearchAppCommand({
  credentials,
  indexName,
  displayAttributes,
  imageAttribute,
  facets,
}: {
  credentials: { appId: string; searchApiKey: string };
  indexName: string;
  displayAttributes: string[];
  imageAttribute?: string;
  facets: string[];
}): string {
  const quote = (value: string) =>
    /^[\w.,:/@-]+$/.test(value) ? value : JSON.stringify(value);
  const parts = [
    npxCommand('search-app'),
    '--template "React InstantSearch"',
    `--app-id ${quote(credentials.appId)}`,
    `--api-key ${quote(credentials.searchApiKey)}`,
    `--index-name ${quote(indexName)}`,
  ];
  if (displayAttributes.length > 0) {
    parts.push(
      `--attributes-to-display ${quote(displayAttributes.slice(0, 3).join(','))}`
    );
  }
  if (imageAttribute) parts.push(`--image-attribute ${quote(imageAttribute)}`);
  if (facets.length > 0) {
    parts.push(
      `--attributes-for-faceting ${quote(facets.slice(0, 4).join(','))}`
    );
  }
  parts.push('--enable-insights', '--no-interactive');
  return parts.join(' ');
}

async function findQuerySuggestionsIndex(
  search: SearchFn,
  credentials: { appId: string; searchApiKey: string },
  indexName: string
): Promise<string | null> {
  const candidates = [
    `${indexName}_query_suggestions`,
    `${indexName}_demo_query_suggestions`,
  ];
  const found = await Promise.all(
    candidates.map((candidate) =>
      search(credentials, {
        indexName: candidate,
        hitsPerPage: 1,
        withFacets: false,
      })
        .then((response) => (response.nbHits ?? response.hits?.length ?? 0) > 0)
        // not found or not readable with this key
        .catch(() => false)
    )
  );
  return candidates.find((_, i) => found[i]) ?? null;
}

function classifyAlgoliaError(error: unknown): ErrorCode {
  const status =
    typeof error === 'object' && error !== null
      ? (error as { status?: unknown }).status
      : undefined;
  if (status === 404) return 'index_not_found';
  if (status === 401 || status === 403) return 'credentials_invalid';
  return 'algolia_error';
}

type ResolvedCredentials =
  | {
      ok: true;
      value: { appId: string; searchApiKey: string };
      source: string;
    }
  | { ok: false; envelope: ReturnType<typeof failureEnvelope> };

function resolveCredentials(options: IntrospectOptions): ResolvedCredentials {
  // If either flag is set, require both: don't silently mix sources.
  if (options.appId || options.searchApiKey) {
    if (!options.appId || !options.searchApiKey) {
      return {
        ok: false,
        envelope: failureEnvelope(
          COMMAND,
          'missing_required_flag',
          options.appId
            ? '--search-api-key is required when --app-id is passed.'
            : '--app-id is required when --search-api-key is passed.'
        ),
      };
    }
    return {
      ok: true,
      value: { appId: options.appId, searchApiKey: options.searchApiKey },
      source: 'flags',
    };
  }

  const manifest = readManifest(path.join(options.cwd, MANIFEST_FILENAME), {
    command: COMMAND,
  });
  if (manifest.ok) {
    return {
      ok: true,
      value: {
        appId: manifest.manifest.algolia.appId,
        searchApiKey: manifest.manifest.algolia.searchApiKey,
      },
      source: MANIFEST_FILENAME,
    };
  }

  const env = readProjectCredentials(options.cwd, options.env);
  if (env.appId && env.searchApiKey) {
    return {
      ok: true,
      value: { appId: env.appId.value, searchApiKey: env.searchApiKey.value },
      source: `${env.appId.variable} and ${env.searchApiKey.variable} (${env.appId.file ?? 'environment'})`,
    };
  }

  return {
    ok: false,
    envelope: failureEnvelope(
      COMMAND,
      'missing_credentials',
      `Algolia credentials not found. Pass --app-id and --search-api-key, set ALGOLIA_APP_ID and ALGOLIA_SEARCH_API_KEY in .env.local, or run \`${npxCommand(
        'init'
      )}\` first.`
    ),
  };
}

function resolveIndexName(options: IntrospectOptions): string | undefined {
  if (options.index) return options.index;
  const manifest = readManifest(path.join(options.cwd, MANIFEST_FILENAME), {
    command: COMMAND,
  });
  if (manifest.ok && manifest.manifest.algolia.indexName) {
    return manifest.manifest.algolia.indexName;
  }
  return readProjectCredentials(options.cwd, options.env).indexName?.value;
}

function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function emitFailure(
  io: IO,
  json: boolean,
  envelope: ReturnType<typeof failureEnvelope>
): void {
  if (json) {
    io.stdout(formatEnvelope(envelope));
  } else {
    io.stderr(`${envelope.message}\n`);
  }
}

function emitSuccess(io: IO, json: boolean, data: IntrospectData): void {
  const envelope = successEnvelope(COMMAND, {
    data,
    nextSteps: [
      'Present 2-3 UI options built from data.widgetPlan and let the user choose before writing code.',
      "Check each widget's props against the installed react-instantsearch types before using it.",
      'For an empty folder, run data.createInstantSearchAppCommand.',
    ],
  });
  if (json) {
    io.stdout(formatEnvelope(envelope));
    return;
  }
  io.stdout(`introspect: index ${data.indexName} (${data.nbHits} records)\n`);
  io.stdout(
    `  searchable attributes: ${data.searchableAttributes.join(', ') || '(none)'}\n`
  );
  io.stdout(`  facets: ${data.facets.join(', ') || '(none)'}\n`);
  io.stdout(
    `  image attribute: ${data.imageAttributes[0] ?? '(none found)'}\n`
  );
  io.stdout('  suggested widgets:\n');
  for (const suggestion of data.widgetPlan) {
    const target =
      suggestion.attribute ??
      suggestion.attributes?.join(', ') ??
      suggestion.index ??
      '';
    io.stdout(
      `    - ${suggestion.widget}${target ? ` (${target})` : ''}: ${suggestion.reason}\n`
    );
  }
}
