/**
 * @jest-environment jsdom
 */
import { runTestSuites } from '@instantsearch/tests/common';
import * as testSuites from '@instantsearch/tests/widgets';

import { nextTick, mountApp } from '../../test/utils';
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
} from '../instantsearch';
import { renderCompat } from '../util/vue-compat';

jest.unmock('instantsearch.js/es');

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
    mountApp(
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
    mountApp(
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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { transformItems, ...hierarchicalWidgetParams } = widgetParams;

    mountApp(
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
    mountApp(
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
    mountApp(
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
    mountApp(
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
    mountApp(
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
    mountApp(
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
  createInstantSearchWidgetTests({ instantSearchOptions }) {
    mountApp(
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
        `instantsearch.js (${
          require('../../../instantsearch.js/package.json').version
        })`,
        `Vue InstantSearch (${
          require('../../../vue-instantsearch/package.json').version
        })`,
        `Vue (${require('../util/vue-compat').version})`,
      ],
    };
  },
  async createHitsPerPageWidgetTests({ instantSearchOptions, widgetParams }) {
    mountApp(
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

    mountApp(
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
    testParams,
  }) {
    const refinementListAttributes = Object.keys(
      instantSearchOptions.initialUiState?.indexName.refinementList || {}
    );

    const search = (h) =>
      h(AisInstantSearch, { props: instantSearchOptions }, [
        h(AisSearchBox),
        ...refinementListAttributes.map((attribute) =>
          h(AisRefinementList, { props: { attribute } })
        ),
        h(AisCurrentRefinements, { props: widgetParams }),
        h(GlobalErrorSwallower),
      ]);

    mountApp(
      {
        render: renderCompat((h) =>
          testParams?.formWrapperSubmitHandler
            ? h(
                'form',
                {
                  on: {
                    submit: testParams.formWrapperSubmitHandler,
                  },
                },
                [search(h)]
              )
            : search(h)
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
};

const testOptions = {
  createRefinementListWidgetTests: undefined,
  createHierarchicalMenuWidgetTests: undefined,
  createBreadcrumbWidgetTests: undefined,
  createMenuWidgetTests: undefined,
  createPaginationWidgetTests: undefined,
  createInfiniteHitsWidgetTests: undefined,
  createHitsWidgetTests: undefined,
  createRangeInputWidgetTests: undefined,
  createInstantSearchWidgetTests: undefined,
  createHitsPerPageWidgetTests: undefined,
  createClearRefinementsWidgetTests: undefined,
  createCurrentRefinementsWidgetTests: undefined,
};

describe('Common widget tests (Vue InstantSearch)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
