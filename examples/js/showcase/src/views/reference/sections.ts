/**
 * The API reference's own grouping and order, transcribed from the section
 * headings and link order of
 * https://www.algolia.com/doc/api-reference/widgets/js/
 *
 * Entries are the documentation's URL slugs, so this stays checkable against
 * that page. Widgets this view doesn't carry are listed anyway, to keep the
 * transcription whole and make the order obvious when one is added later.
 */
export const DOC_SECTIONS: Array<{ title: string; slugs: string[] }> = [
  {
    title: 'Basics',
    slugs: [
      'instantsearch',
      'index-widget',
      'search-box',
      'configure',
      'panel',
      'autocomplete',
      'chat',
      'chat-trigger',
      'prompt-suggestions',
      'feeds',
      'voice-search',
      'insights',
      'middleware',
      'render-state',
    ],
  },
  {
    title: 'Results',
    slugs: [
      'hits',
      'infinite-hits',
      'highlight',
      'reverse-highlight',
      'snippet',
      'reverse-snippet',
    ],
  },
  {
    title: 'Recommendations',
    slugs: [
      'frequently-bought-together',
      'related-products',
      'trending-items',
      'trending-facets',
      'looking-similar',
    ],
  },
  {
    title: 'Refinements',
    slugs: [
      'refinement-list',
      'color-refinement-list',
      'dynamic-widgets',
      'hierarchical-menu',
      'range-slider',
      'menu',
      'current-refinements',
      'range-input',
      'menu-select',
      'toggle-refinement',
      'numeric-menu',
      'rating-menu',
      'clear-refinements',
    ],
  },
  { title: 'Pagination', slugs: ['pagination', 'hits-per-page'] },
  {
    title: 'Metadata',
    slugs: [
      'breadcrumb',
      'stats',
      'powered-by',
      'analytics',
      'query-rule-custom-data',
      'query-rule-context',
    ],
  },
  { title: 'Sorting', slugs: ['sort-by', 'relevant-sort'] },
  { title: 'Geo search', slugs: ['geo-search'] },
];
