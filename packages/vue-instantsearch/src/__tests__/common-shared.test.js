/**
 * @jest-environment jsdom
 */
import { createSharedTests } from '@instantsearch/tests';

import { nextTick, mountApp } from '../../test/utils';
import { renderCompat } from '../util/vue-compat';
import {
  AisHits,
  AisInstantSearch,
  AisMenu,
  AisPagination,
  createWidgetMixin,
} from '../instantsearch';
import { connectMenu, connectPagination } from 'instantsearch.js/es/connectors';
jest.unmock('instantsearch.js/es');

createSharedTests(async ({ instantSearchOptions, widgetParams }) => {
  const CustomMenu = createCustomWidget({
    connector: connectMenu,
    name: 'Menu',
    requiredProps: ['attribute'],
    urlValue: 'value',
  });
  const CustomPagination = createCustomWidget({
    connector: connectPagination,
    name: 'Pagination',
    urlValue: 10,
  });

  mountApp(
    {
      render: renderCompat((h) =>
        h(AisInstantSearch, { props: instantSearchOptions }, [
          h(CustomMenu, { props: widgetParams.menu }),
          h(AisMenu, { props: widgetParams.menu }),
          h(AisHits, { props: widgetParams.hits }),
          h(CustomPagination, { props: widgetParams.pagination }),
          h(AisPagination, { props: widgetParams.pagination }),
        ])
      ),
    },
    document.body.appendChild(document.createElement('div'))
  );

  await nextTick();
});

function createCustomWidget({ connector, name, urlValue, requiredProps = [] }) {
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
