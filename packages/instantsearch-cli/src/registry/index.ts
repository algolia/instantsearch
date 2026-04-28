import type { WidgetMeta, GeneratorContext, GenerateResult } from '../shared-types';

import { generate as generateReactStructural } from './generators/react/structural';
import { generate as generateReactHits } from './generators/react/hits';
import { generate as generateReactRefinementList } from './generators/react/refinement-list';
import { generate as generateReactSortBy } from './generators/react/sort-by';

import { generate as generateJsStructural } from './generators/js/structural';
import { generate as generateJsHits } from './generators/js/hits';
import { generate as generateJsRefinementList } from './generators/js/refinement-list';
import { generate as generateJsSortBy } from './generators/js/sort-by';

import type { ExperienceSchema } from '../manifest';
import type { Flavor } from '../types';

export type SchemaStatus =
  | 'satisfied'
  | 'skippable'
  | { missing: string };

type SchemaCheck = (schema: ExperienceSchema) => SchemaStatus;

export type WidgetGenerator = {
  meta: WidgetMeta;
  generate: (ctx: GeneratorContext) => GenerateResult;
};

const SEARCH_BOX_META: WidgetMeta = { name: 'SearchBox', params: {} };
const PAGINATION_META: WidgetMeta = { name: 'Pagination', params: {} };
const CLEAR_REFINEMENTS_META: WidgetMeta = {
  name: 'ClearRefinements',
  params: {},
};
const HITS_META: WidgetMeta = {
  name: 'Hits',
  params: {},
  introspection: {
    title: { required: true, source: 'searchableAttribute' },
    image: { required: false, source: 'searchableAttribute' },
    description: { required: false, source: 'searchableAttribute' },
  },
};
const REFINEMENT_LIST_META: WidgetMeta = {
  name: 'RefinementList',
  params: { attribute: { required: true, source: 'facet' } },
};
const SORT_BY_META: WidgetMeta = {
  name: 'SortBy',
  params: { items: { required: true, source: 'replica' } },
};

const SCHEMA_CHECKS: Record<string, SchemaCheck> = {
  Hits: (schema) =>
    schema.hits?.title ? 'satisfied' : { missing: '--hits-title' },
  RefinementList: (schema) =>
    schema.refinementList && schema.refinementList.length > 0 ? 'satisfied' : 'skippable',
  SortBy: (schema) =>
    schema.sortBy?.replicas && schema.sortBy.replicas.length > 0 ? 'satisfied' : 'skippable',
};

export const UNSUPPORTED_WIDGETS: ReadonlySet<string> = new Set([
  'Autocomplete',
  'Breadcrumb',
  'Chat',
  'CurrentRefinements',
  'FrequentlyBoughtTogether',
  'HierarchicalMenu',
  'Highlight',
  'HitsPerPage',
  'InfiniteHits',
  'LookingSimilar',
  'Menu',
  'PoweredBy',
  'RangeInput',
  'RelatedProducts',
  'ReverseHighlight',
  'Snippet',
  'Stats',
  'ToggleRefinement',
  'TrendingItems',
  'TrendingFacets',
  'FilterSuggestions',
]);

const REACT_GENERATORS: Record<string, WidgetGenerator> = {
  SearchBox: { meta: SEARCH_BOX_META, generate: generateReactStructural },
  Pagination: { meta: PAGINATION_META, generate: generateReactStructural },
  ClearRefinements: { meta: CLEAR_REFINEMENTS_META, generate: generateReactStructural },
  Hits: { meta: HITS_META, generate: generateReactHits },
  RefinementList: { meta: REFINEMENT_LIST_META, generate: generateReactRefinementList },
  SortBy: { meta: SORT_BY_META, generate: generateReactSortBy },
};

const WIDGET_NAMES: readonly string[] = Object.keys(REACT_GENERATORS);

const JS_GENERATORS: Record<string, WidgetGenerator> = {
  SearchBox: { meta: SEARCH_BOX_META, generate: generateJsStructural },
  Pagination: { meta: PAGINATION_META, generate: generateJsStructural },
  ClearRefinements: { meta: CLEAR_REFINEMENTS_META, generate: generateJsStructural },
  Hits: { meta: HITS_META, generate: generateJsHits },
  RefinementList: { meta: REFINEMENT_LIST_META, generate: generateJsRefinementList },
  SortBy: { meta: SORT_BY_META, generate: generateJsSortBy },
};

const REGISTRY: Record<Flavor, Record<string, WidgetGenerator>> = {
  react: REACT_GENERATORS,
  js: JS_GENERATORS,
};

export function getGenerator(
  widgetName: string,
  flavor: Flavor
): WidgetGenerator | null {
  return REGISTRY[flavor][widgetName] ?? null;
}

export function getSupportedWidgets(): readonly string[] {
  return WIDGET_NAMES;
}

export function getSchemaStatus(
  widgetName: string,
  schema: ExperienceSchema
): SchemaStatus {
  const check = SCHEMA_CHECKS[widgetName];
  if (!check) return 'satisfied';
  return check(schema);
}

export function resolveBaseWidgetName(widgetName: string): string | null {
  if (WIDGET_NAMES.includes(widgetName)) return widgetName;
  if (/^RefinementList[A-Z]/.test(widgetName)) return 'RefinementList';
  return null;
}
