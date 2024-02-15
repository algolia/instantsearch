/**
 * @jest-environment jsdom
 */
import { runTestSuites } from '@instantsearch/tests/common';
import * as testSuites from '@instantsearch/tests/connectors';
import {
  connectBreadcrumb,
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

import { nextTick, mountApp } from '../../test/utils';
import {
  AisInstantSearch,
  AisMenu,
  AisRefinementList,
  createWidgetMixin,
} from '../instantsearch';
import { renderCompat } from '../util/vue-compat';
jest.unmock('instantsearch.js/es');

const testSetups = {
  async createRefinementListConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const CustomRefinementList = createCustomWidget({
      connector: connectRefinementList,
      name: 'RefinementList',
      requiredProps: ['attribute'],
      urlValue: 'value',
      refineComponents: [
        (h, state) =>
          h(
            'form',
            {
              on: {
                submit: (event) => {
                  state.refine(event.currentTarget.elements[0].value);
                },
              },
            },
            [
              h('input', {
                attrs: {
                  type: 'text',
                  'data-testid': 'RefinementList-refine-input',
                },
              }),
            ]
          ),
      ],
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomRefinementList, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createHierarchicalMenuConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const CustomHierarchicalMenu = createCustomWidget({
      connector: connectHierarchicalMenu,
      name: 'HierarchicalMenu',
      requiredProps: ['attributes'],
      urlValue: 'value',
      refineComponents: [
        (h, state) =>
          h(
            'form',
            {
              on: {
                submit: (event) => {
                  state.refine(event.currentTarget.elements[0].value);
                },
              },
            },
            [
              h('input', {
                attrs: {
                  type: 'text',
                  'data-testid': 'HierarchicalMenu-refine-input',
                },
              }),
            ]
          ),
      ],
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomHierarchicalMenu, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createBreadcrumbConnectorTests({ instantSearchOptions, widgetParams }) {
    const CustomBreadcrumb = createCustomWidget({
      connector: connectBreadcrumb,
      name: 'Breadcrumb',
      requiredProps: ['attributes'],
      urlValue: 'Apple > iPhone',
      refineValue: 'Apple',
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomBreadcrumb, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    const CustomMenu = createCustomWidget({
      connector: connectMenu,
      name: 'Menu',
      requiredProps: ['attribute'],
      urlValue: 'value',
      refineComponents: [
        (h, state) =>
          h(
            'form',
            {
              on: {
                submit: (event) => {
                  state.refine(event.currentTarget.elements[0].value);
                },
              },
            },
            [
              h('input', {
                attrs: {
                  type: 'text',
                  'data-testid': 'Menu-refine-input',
                },
              }),
            ]
          ),
      ],
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomMenu, { props: widgetParams }),
            h(AisMenu, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createPaginationConnectorTests({ instantSearchOptions, widgetParams }) {
    const CustomPagination = createCustomWidget({
      connector: connectPagination,
      name: 'Pagination',
      urlValue: 10,
      refineValue: (state) => (state.currentRefinement === 0 ? 1 : 0),
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomPagination, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createCurrentRefinementsConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const CustomCurrentRefinements = createCustomWidget({
      connector: connectCurrentRefinements,
      name: 'CurrentRefinements',
      urlValue: {
        attribute: 'brand',
        type: 'disjunctive',
        value: 'Apple',
        label: 'Apple',
      },
      refineValue: {
        attribute: 'brand',
        type: 'disjunctive',
        value: 'Samsung',
        label: 'Samsung',
      },
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomCurrentRefinements, { props: widgetParams }),
            h(AisRefinementList, { props: { attribute: 'brand' } }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createHitsPerPageConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const CustomHitsPerPage = createCustomWidget({
      connector: connectHitsPerPage,
      name: 'HitsPerPage',
      requiredProps: ['items'],
      urlValue: 12,
      refineValue: (state) => (state.value === 10 ? 5 : 10),
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomHitsPerPage, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createNumericMenuConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const CustomNumericMenu = createCustomWidget({
      connector: connectNumericMenu,
      name: 'NumericMenu',
      requiredProps: ['attribute', 'items'],
      urlValue: encodeURI('{ "start": 500 }'),
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomNumericMenu, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createRatingMenuConnectorTests({ instantSearchOptions, widgetParams }) {
    const CustomRatingMenu = createCustomWidget({
      connector: connectRatingMenu,
      name: 'RatingMenu',
      requiredProps: ['attribute'],
      urlValue: encodeURI('5'),
      refineValue: 5,
    });

    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(CustomRatingMenu, { props: widgetParams }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
  async createToggleRefinementConnectorTests({
    instantSearchOptions,
    widgetParams,
  }) {
    const CustomToggleRefinement = createCustomWidget({
      name: 'ToggleRefinement',
      connector: connectToggleRefinement,
      requiredProps: ['attribute', 'label'],
      refineValue: (state) => state.value,
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
            h(CustomToggleRefinement, { props }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
};

function createCustomWidget({
  connector,
  name,
  urlValue,
  refineValue,
  requiredProps = [],
  refineComponents = [
    (h, state) =>
      h(
        'button',
        {
          attrs: {
            'data-testid': `${name}-refine`,
          },
          on: {
            click: () => {
              state.refine(
                typeof refineValue === 'function'
                  ? refineValue(state)
                  : refineValue
              );
            },
          },
        },
        'REFINE'
      ),
  ],
}) {
  return {
    name: `Custom${name}`,
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
        ? h('div', {}, [
            h(
              'a',
              {
                attrs: {
                  'data-testid': `${name}-link`,
                  href: this.state.createURL(urlValue),
                },
              },
              'LINK'
            ),
            ...refineComponents.map((component) => component(h, this.state)),
          ])
        : null;
    }),
  };
}

const testOptions = {
  createHierarchicalMenuConnectorTests: undefined,
  createBreadcrumbConnectorTests: undefined,
  createRefinementListConnectorTests: undefined,
  createMenuConnectorTests: undefined,
  createPaginationConnectorTests: undefined,
  createCurrentRefinementsConnectorTests: undefined,
  createHitsPerPageConnectorTests: undefined,
  createNumericMenuConnectorTests: undefined,
  createRatingMenuConnectorTests: undefined,
  createToggleRefinementConnectorTests: undefined,
};

describe('Common connector tests (Vue InstantSearch)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
