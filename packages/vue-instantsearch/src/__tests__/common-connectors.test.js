/**
 * @jest-environment jsdom
 */
import {
  createBreadcrumbConnectorTests,
  createCurrentRefinementsConnectorTests,
  createHierarchicalMenuConnectorTests,
  createHitsPerPageConnectorTests,
  createMenuConnectorTests,
  createNumericMenuConnectorTests,
  createPaginationConnectorTests,
  createRatingMenuConnectorTests,
  createRefinementListConnectorTests,
  createToggleRefinementConnectorTests,
} from '@instantsearch/tests';

import { nextTick, mountApp } from '../../test/utils';
import { renderCompat } from '../util/vue-compat';
import {
  AisInstantSearch,
  AisMenu,
  AisRefinementList,
  createWidgetMixin,
} from '../instantsearch';
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
jest.unmock('instantsearch.js/es');

createRefinementListConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
    const CustomRefinementList = createCustomWidget({
      connector: connectRefinementList,
      name: 'RefinementList',
      requiredProps: ['attribute'],
      urlValue: 'value',
      refineValue: 'Apple',
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
  }
);

createHierarchicalMenuConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
    const CustomHierarchicalMenu = createCustomWidget({
      connector: connectHierarchicalMenu,
      name: 'HierarchicalMenu',
      requiredProps: ['attributes'],
      urlValue: 'value',
      refineValue: 'Apple',
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
  }
);

createBreadcrumbConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createMenuConnectorTests(async ({ instantSearchOptions, widgetParams }) => {
  const CustomMenu = createCustomWidget({
    connector: connectMenu,
    name: 'Menu',
    requiredProps: ['attribute'],
    urlValue: 'value',
    refineValue: 'Apple',
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
});

createPaginationConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createCurrentRefinementsConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createHitsPerPageConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createNumericMenuConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

createRatingMenuConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
    const CustomRatingMenu = createCustomWidget({
      connector: connectRatingMenu,
      name: 'RatingMenu',
      requiredProps: ['attribute'],
      urlValue: encodeURI('5'),
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
  }
);

createToggleRefinementConnectorTests(
  async ({ instantSearchOptions, widgetParams }) => {
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
  }
);

function createCustomWidget({
  connector,
  name,
  urlValue,
  refineValue,
  requiredProps = [],
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
        ? h('div', [
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
            h('button', {
              attrs: {
                'data-testid': `${name}-refine`,
              },
              on: {
                click: () => {
                  this.state.refine(
                    typeof refineValue === 'function'
                      ? refineValue(this.state)
                      : refineValue
                  );
                },
              },
            }),
          ])
        : null;
    }),
  };
}
