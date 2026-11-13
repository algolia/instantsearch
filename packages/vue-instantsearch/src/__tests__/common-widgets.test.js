/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runTestSuites } from '@instantsearch/tests/common';
import * as testSuites from '@instantsearch/tests/widgets';
import { connectCompare } from 'instantsearch-core';

import { nextTick, mountApp, mountAppOrThrow } from '../../test/utils';
import {
  AisInstantSearch,
  AisRefinementList,
  AisHierarchicalMenu,
  AisBreadcrumb,
  AisMenu,
  AisPagination,
  AisInfiniteHits,
  AisSearchBox,
  createWidgetMixin,
  AisHits,
  AisIndex,
  AisRangeInput,
  AisHitsPerPage,
  AisClearRefinements,
  AisCurrentRefinements,
  AisToggleRefinement,
  AisSortBy,
  AisStats,
  AisRatingMenu,
  AisNumericMenu,
  AisPoweredBy,
  AisMenuSelect,
  AisDynamicWidgets,
  AisRelatedProducts,
  AisExperimentalAutocomplete,
  AisFrequentlyBoughtTogether,
  AisLookingSimilar,
  AisTrendingItems,
  AisTrendingFacets,
  AisChat,
  AisChatTrigger,
  AisPromptSuggestions,
  AisCompareBar,
  AisResultCard,
} from '../instantsearch';
import { isVue3, renderCompat } from '../util/vue-compat';

jest.unmock('instantsearch-core');

// The setups below only clear the DOM between tests, so a mounted app keeps
// running afterwards: a connector with scheduled work (e.g. the prompt
// suggestions' debounced fetch) can then fire into the *next* test and hit
// its mocks. Track every mounted app and dispose it after each test.
const mountedApps = [];

const trackMountApp = (...args) => {
  const app = mountApp(...args);
  mountedApps.push(app);
  return app;
};

const trackMountAppOrThrow = (...args) => {
  const app = mountAppOrThrow(...args);
  mountedApps.push(app);
  return app;
};

afterEach(() => {
  while (mountedApps.length) {
    const app = mountedApps.pop();
    try {
      if (isVue3) {
        app.$.appContext.app.unmount();
      } else {
        app.$destroy();
      }
    } catch (error) {
      // The app is already gone; nothing to dispose.
    }
  }
});

/**
 * prevent rethrowing InstantSearch errors, so tests can be asserted.
 * IRL this isn't needed, as the error doesn't stop execution.
 */
const GlobalErrorSwallower = {
  mixins: [createWidgetMixin({ connector: true })],
  mounted() {
    this.instantSearchInstance.on('error', () => {});
  },
  render() {
    return null;
  },
};

const testSetups = {
  async createRefinementListWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisRefinementList, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createHierarchicalMenuWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisHierarchicalMenu, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createBreadcrumbWidgetTests({ instantSearchOptions, widgetParams }) {
    // The passed `transformItems` prop is meant to apply only to the breadcrumb,
    // not the hierarchical menu
    // eslint-disable-next-line no-unused-vars
    const { transformItems, ...hierarchicalWidgetParams } = widgetParams;

    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisBreadcrumb, { props: widgetParams }),
            h(AisHierarchicalMenu, { props: hierarchicalWidgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisMenu, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createPaginationWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisPagination, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createInfiniteHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisSearchBox),
            h(AisInfiniteHits, {
              attrs: { id: 'main-hits' },
              props: widgetParams,
              scopedSlots: {
                item: ({ item: hit, sendEvent }) =>
                  h(
                    'div',
                    {
                      attrs: {
                        'data-testid': `main-hits-top-level-${hit.__position}`,
                      },
                    },
                    [
                      hit.objectID,
                      h('button', {
                        attrs: {
                          'data-testid': `main-hits-convert-${hit.__position}`,
                        },
                        on: {
                          click: () =>
                            sendEvent('conversion', hit, 'Converted'),
                        },
                      }),
                      h('button', {
                        attrs: {
                          'data-testid': `main-hits-click-${hit.__position}`,
                        },
                        on: {
                          click: () => sendEvent('click', hit, 'Clicked'),
                        },
                      }),
                    ]
                  ),
              },
            }),
            h('div', { attrs: { id: 'hits-with-defaults' } }, [
              h(AisInfiniteHits, { props: widgetParams }),
            ]),
            h(AisIndex, { props: { indexName: 'nested' } }, [
              h(AisInfiniteHits, {
                attrs: { id: 'nested-hits' },
                scopedSlots: {
                  item: ({ item: hit, sendEvent }) =>
                    h(
                      'div',
                      {
                        attrs: {
                          'data-testid': `nested-hits-top-level-${hit.__position}`,
                        },
                      },
                      [
                        hit.objectID,
                        h('button', {
                          attrs: {
                            'data-testid': `nested-hits-click-${hit.__position}`,
                          },
                          on: {
                            click: () =>
                              sendEvent('click', hit, 'Clicked nested'),
                          },
                        }),
                      ]
                    ),
                },
              }),
            ]),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisSearchBox),
            h(AisHits, {
              attrs: { id: 'main-hits' },
              props: widgetParams,
              scopedSlots: {
                item: ({ item: hit, sendEvent }) =>
                  h(
                    'div',
                    {
                      attrs: {
                        'data-testid': `main-hits-top-level-${hit.__position}`,
                      },
                    },
                    [
                      hit.objectID,
                      h('button', {
                        attrs: {
                          'data-testid': `main-hits-convert-${hit.__position}`,
                        },
                        on: {
                          click: () =>
                            sendEvent('conversion', hit, 'Converted'),
                        },
                      }),
                      h('button', {
                        attrs: {
                          'data-testid': `main-hits-click-${hit.__position}`,
                        },
                        on: {
                          click: () => sendEvent('click', hit, 'Clicked'),
                        },
                      }),
                    ]
                  ),
              },
            }),
            h('div', { attrs: { id: 'hits-with-defaults' } }, [
              h(AisHits, { props: widgetParams }),
            ]),
            h(AisIndex, { props: { indexName: 'nested' } }, [
              h(AisHits, {
                attrs: { id: 'nested-hits' },
                scopedSlots: {
                  item: ({ item: hit, sendEvent }) =>
                    h(
                      'div',
                      {
                        attrs: {
                          'data-testid': `nested-hits-top-level-${hit.__position}`,
                        },
                      },
                      [
                        hit.objectID,
                        h('button', {
                          attrs: {
                            'data-testid': `nested-hits-click-${hit.__position}`,
                          },
                          on: {
                            click: () =>
                              sendEvent('click', hit, 'Clicked nested'),
                          },
                        }),
                      ]
                    ),
                },
              }),
            ]),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createRangeInputWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisRangeInput, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  createRangeSliderWidgetTests() {
    throw new Error('RangeSlider is not supported in Vue InstantSearch');
  },
  createInstantSearchWidgetTests({ instantSearchOptions }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    return {
      algoliaAgents: [
        `instantsearch-core (${
          require('../../../instantsearch-core/package.json').version
        })`,
        `Vue InstantSearch (${
          require('../../../vue-instantsearch/package.json').version
        })`,
        `Vue (${require('../util/vue-compat').version})`,
      ],
    };
  },
  async createHitsPerPageWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisHitsPerPage, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createClearRefinementsWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const refinementListAttributes = Object.keys(
      instantSearchOptions.initialUiState?.indexName.refinementList || {}
    );

    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            ...refinementListAttributes.map((attribute) =>
              h(AisRefinementList, { props: { attribute } })
            ),
            h(AisCurrentRefinements),
            h(AisClearRefinements, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createCurrentRefinementsWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h('form', {}, [
            h(AisInstantSearch, { props: instantSearchOptions }, [
              h(AisSearchBox),
              h(AisRefinementList, { props: { attribute: 'brand' } }),
              h(AisRefinementList, {
                props: { operator: 'and', attribute: 'feature' },
              }),
              h(AisHierarchicalMenu, {
                props: {
                  attributes: [
                    'hierarchicalCategories.lvl0',
                    'hierarchicalCategories.lvl1',
                    'hierarchicalCategories.lvl2',
                  ],
                },
              }),
              h(AisRangeInput, { props: { attribute: 'price' } }),
              h(AisCurrentRefinements, { props: widgetParams }),
              h(GlobalErrorSwallower),
            ]),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createRatingMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisRatingMenu, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createNumericMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisNumericMenu, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createToggleRefinementWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisToggleRefinement, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createSearchBoxWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisSearchBox, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createSortByWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisSortBy, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createStatsWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h('div', {}, [
            h(AisInstantSearch, { props: instantSearchOptions }, [
              h(AisSearchBox),
              h(AisStats, { props: widgetParams }),
              h(GlobalErrorSwallower),
            ]),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createRelatedProductsWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisRelatedProducts, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createFrequentlyBoughtTogetherWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisFrequentlyBoughtTogether, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createTrendingItemsWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisTrendingItems, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createTrendingFacetsWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisTrendingFacets, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createLookingSimilarWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisLookingSimilar, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  createPoweredByWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisPoweredBy, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    return {
      flavor: 'vue-instantsearch',
    };
  },
  async createMenuSelectWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisMenuSelect, { props: widgetParams }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  createDynamicWidgetsWidgetTests({ instantSearchOptions, widgetParams }) {
    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(
              AisDynamicWidgets,
              { props: widgetParams },
              h(AisRefinementList, { props: { attribute: 'brand' } }),
              h(AisMenu, { props: { attribute: 'category' } }),
              h(AisHierarchicalMenu, {
                props: {
                  attributes: [
                    'hierarchicalCategories.lvl0',
                    'hierarchicalCategories.lvl1',
                  ],
                },
              })
            ),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );
  },
  async createChatWidgetTests({ instantSearchOptions, widgetParams }) {
    const {
      renderChat = true,
      renderRefinements,
      ...chatWidgetParams
    } = widgetParams;

    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            renderRefinements && h(AisSearchBox, { key: 'searchbox' }),
            renderRefinements &&
              h(AisRefinementList, {
                key: 'brand',
                props: { attribute: 'brand' },
              }),
            renderRefinements &&
              h(AisRefinementList, {
                key: 'category',
                props: { attribute: 'category' },
              }),
            renderRefinements &&
              h(AisHierarchicalMenu, {
                key: 'hierarchy',
                props: {
                  attributes: [
                    'hierarchicalCategories.lvl0',
                    'hierarchicalCategories.lvl1',
                    'hierarchicalCategories.lvl2',
                  ],
                },
              }),
            h(AisChatTrigger, { key: 'trigger' }),
            renderChat && h(AisChat, { key: 'chat', props: chatWidgetParams }),
            h(GlobalErrorSwallower, { key: 'errors' }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createAutocompleteWidgetTests({ instantSearchOptions, widgetParams }) {
    const { slots = {}, renderChat = false, ...props } = widgetParams;

    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisExperimentalAutocomplete, {
              props,
              scopedSlots: slots,
            }),
            renderChat &&
              h(AisChat, { props: { agentId: 'autocompleteChatAgentId' } }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createPromptSuggestionsWidgetTests({
    instantSearchOptions,
    widgetParams,
  }) {
    // The widget hands clicked suggestions to a `chat` on the same index, and
    // errors without one, so the default setup mounts both. `renderChat: false`
    // is how a test asks for the unconfigured page. `scopedSlots` becomes the
    // component's scoped slots rather than a prop.
    const {
      renderChat = true,
      scopedSlots,
      ...promptSuggestionsWidgetParams
    } = widgetParams;

    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(
              AisPromptSuggestions,
              {
                key: 'prompt-suggestions',
                props: promptSuggestionsWidgetParams,
                scopedSlots,
              },
              []
            ),
            // A dedicated id: the `agentId` the chat suites use keys persisted
            // messages in `sessionStorage` that leak across tests in this file.
            renderChat &&
              h(AisChat, {
                key: 'chat',
                props: { agentId: 'promptSuggestionsChatAgentId' },
              }),
            h(GlobalErrorSwallower, { key: 'errors' }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createCompareBarWidgetTests({ instantSearchOptions, widgetParams }) {
    // The bar hands the comparison to an `ais-chat` on the same index, so the
    // default setup mounts both. A sibling `compare` widget renders a toggle
    // per product, the way a per-hit "Compare" button would.
    const {
      renderChat = true,
      products = [],
      slots = {},
      ...props
    } = widgetParams;

    const CompareToggles = {
      mixins: [createWidgetMixin({ connector: connectCompare })],
      computed: {
        widgetParams() {
          return { configurationId: props.configurationId };
        },
      },
      render: renderCompat(function (h) {
        return h(
          'div',
          {},
          products.map((product) =>
            h('button', {
              key: product.objectID,
              attrs: {
                'data-testid': `CompareToggle-${product.objectID}`,
                'aria-pressed': String(
                  Boolean(this.state && this.state.isSelected(product.objectID))
                ),
              },
              on: { click: () => this.state.toggleItem(product) },
            })
          )
        );
      }),
    };

    trackMountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CompareToggles),
            h(AisCompareBar, { props, scopedSlots: slots }),
            // A dedicated id: the `agentId` the chat suites use keys persisted
            // messages in `sessionStorage` that leak across tests in this file.
            renderChat &&
              h(AisChat, { props: { agentId: 'compareBarChatAgentId' } }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createResultCardWidgetTests({ instantSearchOptions, widgetParams }) {
    // "Continue in chat" needs an `ais-chat` with the card's `agentId` on the
    // same index, so the default setup mounts both. `renderChat: false` is how
    // a test asks for the unconfigured page.
    const { renderChat = true, slots = {}, ...props } = widgetParams;

    trackMountAppOrThrow(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisResultCard, { props, scopedSlots: slots }),
            renderChat && h(AisChat, { props: { agentId: props.agentId } }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
};

const testOptions = {
  createRefinementListWidgetTests: {
    skippedTests: {
      'selects first item on submitting the search (with searchableSelectOnSubmit: true)': true,
      // Vue does not have the JS flavor's `componentDidUpdate` focus
      // restoration; Vue 3 resets `activeElement` to body across re-renders,
      // so the focus assertion is unreliable there. The bug this test
      // catches is in the Preact RefinementList component.
      'keeps focus on toggled input between re-renders (multiple values that should be escaped)': true,
    },
  },
  createHierarchicalMenuWidgetTests: undefined,
  createBreadcrumbWidgetTests: undefined,
  createMenuWidgetTests: undefined,
  createPaginationWidgetTests: undefined,
  createInfiniteHitsWidgetTests: undefined,
  createHitsWidgetTests: undefined,
  createRangeInputWidgetTests: undefined,
  createRangeSliderWidgetTests: {
    skippedTests: { 'RangeSlider widget common tests': true },
  },
  createRatingMenuWidgetTests: undefined,
  createInstantSearchWidgetTests: undefined,
  createHitsPerPageWidgetTests: undefined,
  createClearRefinementsWidgetTests: undefined,
  createCurrentRefinementsWidgetTests: undefined,
  createToggleRefinementWidgetTests: undefined,
  createSearchBoxWidgetTests: {
    skippedTests: { 'searchAsYouType option': true },
  },
  createSortByWidgetTests: undefined,
  createStatsWidgetTests: undefined,
  createRelatedProductsWidgetTests: undefined,
  createFrequentlyBoughtTogetherWidgetTests: undefined,
  createTrendingItemsWidgetTests: undefined,
  createTrendingFacetsWidgetTests: undefined,
  createLookingSimilarWidgetTests: undefined,
  createPoweredByWidgetTests: undefined,
  createDynamicWidgetsWidgetTests: undefined,
  createChatWidgetTests: {
    // Vue batches DOM updates, so flush them after each step the shared tests
    // wrap in `act`.
    act: async (callback) => {
      await callback();
      await nextTick();
    },
  },
  createAutocompleteWidgetTests: undefined,
  createPromptSuggestionsWidgetTests: {
    // Vue batches DOM updates, so flush them after each step the shared tests
    // wrap in `act`.
    act: async (callback) => {
      await callback();
      await nextTick();
    },
  },
  createResultCardWidgetTests: {
    // Vue batches DOM updates, so flush them after each step the shared tests
    // wrap in `act`.
    act: async (callback) => {
      await callback();
      await nextTick();
    },
  },
  createCompareBarWidgetTests: {
    // Vue batches DOM updates, so flush them after each step the shared tests
    // wrap in `act`.
    act: async (callback) => {
      await callback();
      await nextTick();
    },
  },
};

describe('Common widget tests (Vue InstantSearch)', () => {
  runTestSuites({
    flavor: 'vue',
    testSuites,
    testSetups,
    testOptions,
  });
});
