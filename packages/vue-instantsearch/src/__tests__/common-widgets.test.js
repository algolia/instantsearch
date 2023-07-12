/**
 * @jest-environment jsdom
 */
import {
  createRefinementListWidgetTests,
  createHierarchicalMenuWidgetTests,
  createBreadcrumbWidgetTests,
  createMenuWidgetTests,
  createPaginationWidgetTests,
  createInfiniteHitsWidgetTests,
  createHitsWidgetTests,
  createRangeInputWidgetTests,
  createInstantSearchWidgetTests,
} from '@instantsearch/tests';

import { nextTick, mountApp } from '../../test/utils';
import { renderCompat } from '../util/vue-compat';
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
} from '../instantsearch';
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

createRefinementListWidgetTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createHierarchicalMenuWidgetTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createBreadcrumbWidgetTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createMenuWidgetTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createPaginationWidgetTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createInfiniteHitsWidgetTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createHitsWidgetTests(async ({ instantSearchOptions, widgetParams }) => {
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
                        click: () => sendEvent('conversion', hit, 'Converted'),
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
});

createRangeInputWidgetTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createInstantSearchWidgetTests(({ instantSearchOptions }) => {
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
});
