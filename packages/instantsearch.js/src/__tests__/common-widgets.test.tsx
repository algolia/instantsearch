/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/widgets';

import instantsearch from '../index.es';
import {
  hierarchicalMenu,
  breadcrumb,
  menu,
  refinementList,
  pagination,
  infiniteHits,
  searchBox,
  hits,
  index,
  rangeInput,
  hitsPerPage,
  clearRefinements,
  currentRefinements,
  toggleRefinement,
  sortBy,
  stats,
  ratingMenu,
  numericMenu,
  relatedProducts,
  frequentlyBoughtTogether,
  trendingItems,
  lookingSimilar,
  poweredBy,
  menuSelect,
  dynamicWidgets,
  chat,
  EXPERIMENTAL_autocomplete,
  filterSuggestions,
} from '../widgets';

import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites, 'javascript'> = {
  createHierarchicalMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        hierarchicalMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createBreadcrumbWidgetTests({ instantSearchOptions, widgetParams }) {
    const { transformItems, templates, ...hierarchicalWidgetParams } =
      widgetParams;

    instantsearch(instantSearchOptions)
      .addWidgets([
        breadcrumb({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
        hierarchicalMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...hierarchicalWidgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createRefinementListWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        refinementList({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        menu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createPaginationWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        pagination({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createInfiniteHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        searchBox({
          container: document.body.appendChild(document.createElement('div')),
        }),
        infiniteHits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'main-hits',
            })
          ),
          templates: {
            item: (hit, { html, sendEvent }) =>
              html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
                ${hit.objectID}
                <button
                  data-testid=${`main-hits-convert-${hit.__position}`}
                  onClick=${() => sendEvent('conversion', hit, 'Converted')}
                >
                  convert
                </button>
                <button
                  data-testid=${`main-hits-click-${hit.__position}`}
                  onClick=${() => sendEvent('click', hit, 'Clicked')}
                >
                  click
                </button>
              </div>`,
          },
          ...widgetParams,
        }),
        infiniteHits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'hits-with-defaults',
            })
          ),
          ...widgetParams,
        }),
        index({ indexName: 'nested' }).addWidgets([
          infiniteHits({
            container: document.body.appendChild(
              Object.assign(document.createElement('div'), {
                id: 'nested-hits',
              })
            ),
            templates: {
              item: (hit, { html, sendEvent }) =>
                html`<div
                  data-testid=${`nested-hits-top-level-${hit.__position}`}
                >
                  ${hit.objectID}
                  <button
                    data-testid=${`nested-hits-click-${hit.__position}`}
                    onClick=${() => sendEvent('click', hit, 'Clicked nested')}
                  >
                    click
                  </button>
                </div>`,
            },
          }),
        ]),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        searchBox({
          container: document.body.appendChild(document.createElement('div')),
        }),
        hits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'main-hits',
            })
          ),
          templates: {
            item: (hit, { html, sendEvent }) =>
              html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
                ${hit.objectID}
                <button
                  data-testid=${`main-hits-convert-${hit.__position}`}
                  onClick=${() => sendEvent('conversion', hit, 'Converted')}
                >
                  convert
                </button>
                <button
                  data-testid=${`main-hits-click-${hit.__position}`}
                  onClick=${() => sendEvent('click', hit, 'Clicked')}
                >
                  click
                </button>
              </div>`,
          },
          ...widgetParams,
        }),
        hits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'hits-with-defaults',
            })
          ),
          ...widgetParams,
        }),
        index({ indexName: 'nested' }).addWidgets([
          hits({
            container: document.body.appendChild(
              Object.assign(document.createElement('div'), {
                id: 'nested-hits',
              })
            ),
            templates: {
              item: (hit, { html, sendEvent }) =>
                html`<div data-testid=${`nested-hits-${hit.__position}`}>
                  ${hit.objectID}
                  <button
                    data-testid=${`nested-hits-click-${hit.__position}`}
                    onClick=${() => sendEvent('click', hit, 'Clicked nested')}
                  >
                    click
                  </button>
                </div>`,
            },
          }),
        ]),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createRangeInputWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        rangeInput({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createRatingMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        ratingMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution. */
      })
      .start();
  },
  createInstantSearchWidgetTests({ instantSearchOptions }) {
    instantsearch(instantSearchOptions)
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();

    return {
      algoliaAgents: [
        `instantsearch.js (${
          require('../../../instantsearch.js/package.json').version
        })`,
      ],
    };
  },
  createHitsPerPageWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        hitsPerPage({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createClearRefinementsWidgetTests({ instantSearchOptions, widgetParams }) {
    const refinementListAttributes = Object.keys(
      instantSearchOptions.initialUiState?.indexName.refinementList || {}
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        ...refinementListAttributes.map((attribute) =>
          refinementList({
            container: document.body.appendChild(document.createElement('div')),
            attribute,
          })
        ),
        currentRefinements({
          container: document.body.appendChild(document.createElement('div')),
        }),
        clearRefinements({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createCurrentRefinementsWidgetTests({ instantSearchOptions, widgetParams }) {
    const formContainer = document.body.appendChild(
      document.createElement('form')
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        searchBox({
          container: formContainer.appendChild(document.createElement('div')),
        }),
        refinementList({
          container: formContainer.appendChild(document.createElement('div')),
          attribute: 'brand',
        }),
        refinementList({
          container: formContainer.appendChild(document.createElement('div')),
          operator: 'and',
          attribute: 'feature',
        }),
        hierarchicalMenu({
          container: formContainer.appendChild(document.createElement('div')),
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
        }),
        rangeInput({
          container: formContainer.appendChild(document.createElement('div')),
          attribute: 'price',
        }),
        currentRefinements({
          container: formContainer.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createToggleRefinementWidgetTests({
    instantSearchOptions,
    // @ts-expect-error `label` is not part of the props for InstantSearch.js, but is for the other flavors
    widgetParams: { label, ...widgetParams },
  }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        toggleRefinement({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
          templates: {
            labelText: label ? () => label : undefined,
          },
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createSearchBoxWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        searchBox({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createSortByWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        sortBy({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createStatsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        stats({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createNumericMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        numericMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createRelatedProductsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        relatedProducts({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createFrequentlyBoughtTogetherWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        frequentlyBoughtTogether({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createTrendingItemsWidgetTests({ instantSearchOptions, widgetParams }) {
    const { facetName, facetValue, ...params } = widgetParams;
    const facetParams =
      facetName && facetValue ? { facetName, facetValue } : {};

    instantsearch(instantSearchOptions)
      .addWidgets([
        trendingItems({
          container: document.body.appendChild(document.createElement('div')),
          ...facetParams,
          ...params,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createLookingSimilarWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        lookingSimilar({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createPoweredByWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        poweredBy({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         */
      })
      .start();

    return {
      flavor: 'instantsearch.js',
    };
  },
  createMenuSelectWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        menuSelect({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .start();
  },
  createDynamicWidgetsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        dynamicWidgets({
          container: document.body.appendChild(document.createElement('div')),
          widgets: [
            (container) => refinementList({ attribute: 'brand', container }),
            (container) => menu({ attribute: 'category', container }),
            (container) =>
              hierarchicalMenu({
                attributes: [
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                ],
                container,
              }),
          ],
          ...widgetParams,
        }),
      ])
      .start();
  },
  createChatWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        chat({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createAutocompleteWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        EXPERIMENTAL_autocomplete({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createFilterSuggestionsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        filterSuggestions({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
};

const testOptions: TestOptionsMap<TestSuites> = {
  createRefinementListWidgetTests: undefined,
  createHierarchicalMenuWidgetTests: undefined,
  createBreadcrumbWidgetTests: undefined,
  createMenuWidgetTests: undefined,
  createPaginationWidgetTests: undefined,
  createInfiniteHitsWidgetTests: undefined,
  createHitsWidgetTests: {
    skippedTests: {
      'common rendering': true,
    },
  },
  createRangeInputWidgetTests: undefined,
  createRatingMenuWidgetTests: undefined,
  createInstantSearchWidgetTests: undefined,
  createHitsPerPageWidgetTests: undefined,
  createClearRefinementsWidgetTests: undefined,
  createCurrentRefinementsWidgetTests: undefined,
  createToggleRefinementWidgetTests: undefined,
  createSearchBoxWidgetTests: undefined,
  createSortByWidgetTests: undefined,
  createStatsWidgetTests: undefined,
  createNumericMenuWidgetTests: undefined,
  createRelatedProductsWidgetTests: undefined,
  createFrequentlyBoughtTogetherWidgetTests: undefined,
  createTrendingItemsWidgetTests: undefined,
  createLookingSimilarWidgetTests: undefined,
  createPoweredByWidgetTests: undefined,
  createMenuSelectWidgetTests: undefined,
  createDynamicWidgetsWidgetTests: undefined,
  createChatWidgetTests: undefined,
  createAutocompleteWidgetTests: undefined,
  createFilterSuggestionsWidgetTests: undefined,
};

describe('Common widget tests (InstantSearch.js)', () => {
  runTestSuites({
    flavor: 'javascript',
    testSuites,
    testSetups,
    testOptions,
  });
});
