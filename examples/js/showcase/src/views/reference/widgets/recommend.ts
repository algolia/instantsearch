import { carousel } from 'instantsearch.js/es/templates';
import {
  frequentlyBoughtTogether as fbtFn,
  lookingSimilar as lookingSimilarFn,
  relatedProducts as relatedProductsFn,
  trendingFacets as trendingFacetsFn,
  trendingItems as trendingItemsFn,
} from 'instantsearch.js/es/widgets';

import { renderCarouselHit } from '../../../components/widgets/ProductCard';
import { defineWidget } from '../types';

import type { Option } from '../types';

/** trendingFacets items are facet values, not hits, so they need their own. */
function renderFacetValue(
  item: { facetValue: string },
  { html }: { html: (strings: TemplateStringsArray, ...values: any[]) => any }
) {
  return html`<span class="text-sm text-neutral-700 dark:text-neutral-300"
    >${item.facetValue}</span
  >`;
}

/** Same seed record the Recommend view uses. */
const SEED_OBJECT_ID = '5723537';

const objectIDs: Option = {
  key: 'objectIDs',
  label: `['${SEED_OBJECT_ID}']`,
  value: { objectIDs: [SEED_OBJECT_ID] },
};

/**
 * `renderCarouselHit` is styled by the carousel layout's own CSS, so the two
 * belong together: the compact hit inside a scrollable row, rather than tall
 * product cards squeezed into a horizontal list.
 */
const itemTemplate: Option = {
  key: 'templates',
  label: '{ item: renderCarouselHit, layout: carousel() }',
  value: { templates: { item: renderCarouselHit, layout: carousel() } },
};

/** Shared by every Recommend widget. */
const commonToggles: Option[] = [
  {
    key: 'limit',
    label: '3',
    value: { limit: 3 },
  },
  {
    key: 'threshold',
    label: '80',
    value: { threshold: 80 },
  },
  {
    key: 'escapeHTML',
    label: 'false',
    value: { escapeHTML: false },
  },
  {
    key: 'queryParameters',
    label: "{ filters: 'free_shipping:true' }",
    value: { queryParameters: { filters: 'free_shipping:true' } },
  },
  {
    key: 'fallbackParameters',
    label: "{ filters: 'free_shipping:true' }",
    value: { fallbackParameters: { filters: 'free_shipping:true' } },
  },
];

export const frequentlyBoughtTogether = defineWidget({
  name: 'frequentlyBoughtTogether',
  fn: fbtFn,
  flavors: ['js', 'react'],
  slot: 'alone',
  replaces: [],
  defaults: [objectIDs, itemTemplate],
  // No `fallbackParameters`: this widget doesn't accept one.
  toggles: commonToggles.filter((item) => item.key !== 'fallbackParameters'),
});

export const relatedProducts = defineWidget({
  name: 'relatedProducts',
  fn: relatedProductsFn,
  flavors: ['js', 'react'],
  slot: 'alone',
  replaces: [],
  defaults: [objectIDs, itemTemplate],
  toggles: commonToggles,
});

export const lookingSimilar = defineWidget({
  name: 'lookingSimilar',
  fn: lookingSimilarFn,
  flavors: ['js', 'react'],
  slot: 'alone',
  replaces: [],
  defaults: [objectIDs, itemTemplate],
  toggles: commonToggles,
});

export const trendingItems = defineWidget({
  name: 'trendingItems',
  fn: trendingItemsFn,
  flavors: ['js', 'react'],
  slot: 'alone',
  replaces: [],
  defaults: [itemTemplate],
  toggles: [
    // facetName and facetValue only work as a pair.
    {
      key: 'facetName',
      label: "'categories'",
      value: { facetName: 'categories', facetValue: 'Cameras & Camcorders' },
    },
    ...commonToggles,
  ],
});

/**
 * The trending-facets model accepts only indexName, model, threshold,
 * maxRecommendations and facetName, so neither `queryParameters` nor
 * `fallbackParameters` is offered here.
 *
 * Note: this widget 400s as soon as the insights middleware has a userToken,
 * because addInsightsToRecommendParameters adds `queryParameters` to every
 * Recommend query regardless of model. The first request goes out before the
 * token exists, which is why the untouched widget renders.
 */
export const trendingFacets = defineWidget({
  name: 'trendingFacets',
  fn: trendingFacetsFn,
  flavors: ['js', 'react'],
  slot: 'alone',
  replaces: [],
  defaults: [
    {
      key: 'facetName',
      label: "'categories'",
      value: { facetName: 'categories' },
    },
    {
      key: 'templates',
      flavors: ['js'],
      label: '{ item: renderFacetValue }',
      value: { templates: { item: renderFacetValue } },
    },
  ],
  toggles: commonToggles.filter(
    (item) =>
      item.key !== 'queryParameters' && item.key !== 'fallbackParameters'
  ),
});
