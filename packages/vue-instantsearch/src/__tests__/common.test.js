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
  createInstantSearchTests,
  createClearRefinementsTests,
  createCurrentRefinementsTests,
  createHitsPerPageTests,
  createNumericMenuTests,
  createRatingMenuTests,
  createToggleRefinementTests,
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
  AisClearRefinements,
  AisCurrentRefinements,
  AisHitsPerPage,
  AisNumericMenu,
  AisRatingMenu,
  AisToggleRefinement,
} from '../instantsearch';
import {
  connectBreadcrumb,
  connectClearRefinements,
  connectCurrentRefinements,
  connectHierarchicalMenu,
  connectHitsPerPage,
  connectMenu,
  connectNumericMenu,
  connectPagination,
  connectRatingMenu,
  connectRefinementList,
  connectToggleRefinement,
} from 'instantsearch.js/es/connectors';
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
  const RefinementListURL = createURLComponent({
    connector: connectRefinementList,
    name: 'RefinementList',
    requiredProps: ['attribute'],
    urlValue: 'value',
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(RefinementListURL, { props: widgetParams }),
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
  const HierarchicalMenuURL = createURLComponent({
    connector: connectHierarchicalMenu,
    name: 'HierarchicalMenu',
    requiredProps: ['attributes'],
    urlValue: 'value',
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(HierarchicalMenuURL, { props: widgetParams }),
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
  // The passed `transformItems` prop is meant to apply only to the breadcrumb,
  // not the hierarchical menu
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { transformItems, ...hierarchicalWidgetParams } = widgetParams;

  const BreadcrumbURL = createURLComponent({
    connector: connectBreadcrumb,
    name: 'Breadcrumb',
    requiredProps: ['attributes'],
    urlValue: 'Apple > iPhone',
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(BreadcrumbURL, { props: widgetParams }),
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
  const MenuURL = createURLComponent({
    connector: connectMenu,
    name: 'Menu',
    requiredProps: ['attribute'],
    urlValue: 'value',
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(MenuURL, { props: widgetParams }),
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
  const PaginationURL = createURLComponent({
    connector: connectPagination,
    name: 'Pagination',
    urlValue: 10,
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(PaginationURL, { props: widgetParams }),
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

createClearRefinementsTests(async ({ instantSearchOptions, widgetParams }) => {
  const ClearRefinementsURL = createURLComponent({
    connector: connectClearRefinements,
    name: 'ClearRefinements',
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(ClearRefinementsURL, { props: widgetParams }),
          h(AisClearRefinements),
          h(GlobalErrorSwallower),
        ])
      ),
    },
    document.body.appendChild(document.createElement('div'))
  );

  await nextTick();
});

createCurrentRefinementsTests(
  async ({ instantSearchOptions, widgetParams }) => {
    const CurrentRefinementsURL = createURLComponent({
      connector: connectCurrentRefinements,
      name: 'CurrentRefinements',
      urlValue: {
        attribute: 'brand',
        type: 'disjunctive',
        value: 'Apple',
        label: 'Apple',
      },
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CurrentRefinementsURL, { props: widgetParams }),
            h(AisCurrentRefinements),
            h(AisRefinementList, { props: { attribute: 'brand' } }),
            h(GlobalErrorSwallower),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  }
);

createHitsPerPageTests(async ({ instantSearchOptions, widgetParams }) => {
  const HitsPerPageURL = createURLComponent({
    connector: connectHitsPerPage,
    name: 'HitsPerPage',
    requiredProps: ['items'],
    urlValue: 12,
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(HitsPerPageURL, { props: widgetParams }),
          h(AisHitsPerPage, { props: widgetParams }),
          h(GlobalErrorSwallower),
        ])
      ),
    },
    document.body.appendChild(document.createElement('div'))
  );

  await nextTick();
});

createNumericMenuTests(async ({ instantSearchOptions, widgetParams }) => {
  const NumericMenuURL = createURLComponent({
    connector: connectNumericMenu,
    name: 'NumericMenu',
    requiredProps: ['attribute', 'items'],
    urlValue: encodeURI('{ "start": 500 }'),
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(NumericMenuURL, { props: widgetParams }),
          h(AisNumericMenu, { props: widgetParams }),
          h(GlobalErrorSwallower),
        ])
      ),
    },
    document.body.appendChild(document.createElement('div'))
  );

  await nextTick();
});

createRatingMenuTests(async ({ instantSearchOptions, widgetParams }) => {
  const RatingMenuURL = createURLComponent({
    connector: connectRatingMenu,
    name: 'RatingMenu',
    requiredProps: ['attribute'],
    urlValue: encodeURI('5'),
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(RatingMenuURL, { props: widgetParams }),
          h(AisRatingMenu, { props: widgetParams }),
          h(GlobalErrorSwallower),
        ])
      ),
    },
    document.body.appendChild(document.createElement('div'))
  );

  await nextTick();
});

createToggleRefinementTests(async ({ instantSearchOptions, widgetParams }) => {
  const ToggleRefinementURL = createURLComponent({
    name: 'ToggleRefinement',
    connector: connectToggleRefinement,
    requiredProps: ['attribute', 'label'],
  });

  // Label is required in Vue
  const props = {
    ...widgetParams,
    label: 'Free Shipping',
  };

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(ToggleRefinementURL, { props }),
          h(AisToggleRefinement, { props }),
          h(GlobalErrorSwallower),
        ])
      ),
    },
    document.body.appendChild(document.createElement('div'))
  );

  await nextTick();
});

createInstantSearchTests(({ instantSearchOptions }) => {
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

function createURLComponent({ connector, name, urlValue, requiredProps = [] }) {
  return {
    name: `${name}URL`,
    mixins: [createWidgetMixin({ connector })],
    props: Object.fromEntries(
      requiredProps.map((prop) => [prop, { required: true }])
    ),
    computed: {
      widgetParams() {
        return Object.fromEntries(
          requiredProps.map((prop) => [prop, this[prop]])
        );
      },
    },
    render: renderCompat(function (h) {
      return this.state
        ? h(
            'a',
            {
              attrs: {
                'data-testid': `${name}-link`,
                href: this.state.createURL(urlValue),
              },
            },
            'LINK'
          )
        : null;
    }),
  };
}
