/**
 * @jest-environment jsdom
 */
import {
  createRefinementListTests,
  createHierarchicalMenuTests,
  createBreadcrumbTests,
  createMenuTests,
  createPaginationTests,
  createInfiniteHitsTests,
  createHitsTests,
  createRangeInputTests,
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

createRefinementListTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createHierarchicalMenuTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createBreadcrumbTests(async ({ instantSearchOptions, widgetParams }) => {
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

createMenuTests(async ({ instantSearchOptions, widgetParams }) => {
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

createPaginationTests(async ({ instantSearchOptions, widgetParams }) => {
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

createInfiniteHitsTests(async ({ instantSearchOptions, widgetParams }) => {
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
});

createHitsTests(async ({ instantSearchOptions, widgetParams }) => {
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

createRangeInputTests(async ({ instantSearchOptions, widgetParams }) => {
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
