import { liteClient as algoliasearch } from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import { connectQueryRules } from 'instantsearch.js/es/connectors';
import {
  breadcrumb,
  configure,
  clearRefinements,
  currentRefinements,
  dynamicWidgets,
  hierarchicalMenu,
  hits,
  hitsPerPage,
  infiniteHits,
  menu,
  pagination,
  panel,
  poweredBy,
  rangeInput,
  refinementList,
  searchBox,
  sortBy,
  toggleRefinement,
  queryRuleCustomData,
  chat,
} from 'instantsearch.js/es/widgets';

import { createTabsWidget, createRefreshButton } from './helpers';

import 'instantsearch.css/themes/satellite.css';
import './app.css';
import './tabs.css';
import './refresh.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const search = instantsearch({
  indexName: 'instant_search',
  searchClient,
  routing: true,
  insights: true,
});

const customQueryRuleContext = connectQueryRules(() => {});

const itemTemplate = (item, { html }) => html`
  <article class="ais-Carousel-hit">
    <div class="ais-Carousel-hit-image">
      <img src="${item.image}" />
    </div>
    <h2 class="ais-Carousel-hit-title">
      <a
        href="/products.html?pid=${item.objectID}"
        class="ais-Carousel-hit-link"
      >
        ${item.name}
      </a>
    </h2>
  </article>
`;

search.addWidgets([
  configure({
    ruleContexts: [],
  }),
  dynamicWidgets({
    container: '#dynamic-widgets',
    widgets: [
      (container) =>
        panel({
          templates: { header: () => 'Brands' },
        })(refinementList)({
          container,
          attribute: 'brand',
          searchable: true,
          searchablePlaceholder: 'Search brands',
          showMore: true,
        }),
      (container) =>
        panel({
          templates: { header: () => 'Categories' },
        })(menu)({
          container,
          attribute: 'categories',
          showMore: true,
        }),
      (container) =>
        panel({
          templates: { header: () => 'Hierarchy' },
        })(hierarchicalMenu)({
          container,
          attributes: [
            'hierarchicalCategories.lvl0',
            'hierarchicalCategories.lvl1',
            'hierarchicalCategories.lvl2',
          ],
          showMore: true,
        }),
      (container) =>
        panel({
          templates: { header: () => 'Price' },
        })(rangeInput)({
          container,
          attribute: 'price',
          precision: 1,
        }),
      (container) =>
        panel({
          templates: { header: () => 'Free Shipping' },
        })(toggleRefinement)({
          container,
          attribute: 'free_shipping',
          templates: {
            labelText: () => 'Free shipping',
          },
        }),
    ],
  }),
  breadcrumb({
    container: '#breadcrumb',
    attributes: [
      'hierarchicalCategories.lvl0',
      'hierarchicalCategories.lvl1',
      'hierarchicalCategories.lvl2',
    ],
  }),
  searchBox({
    container: '#searchbox',
    placeholder: 'Search',
    autofocus: true,
  }),
  poweredBy({
    container: '#powered-by',
  }),
  hitsPerPage({
    container: '#hits-per-page',
    items: [
      { label: '20 hits per page', value: 20, default: true },
      { label: '40 hits per page', value: 40 },
    ],
  }),
  sortBy({
    container: '#sort-by',
    items: [
      { label: 'Relevance', value: 'instant_search' },
      { label: 'Price (asc)', value: 'instant_search_price_asc' },
      { label: 'Price (desc)', value: 'instant_search_price_desc' },
    ],
  }),
  createRefreshButton({
    container: '#refresh',
  }),
  clearRefinements({
    container: '#clear-refinements',
  }),
  currentRefinements({
    container: '#current-refinements',
    transformItems: (items) =>
      items.map((item) => {
        const label = item.label.startsWith('hierarchicalCategories')
          ? 'Hierarchy'
          : item.label;

        return {
          ...item,
          attribute: label,
        };
      }),
  }),
  customQueryRuleContext({
    trackedFilters: {
      brand: () => ['Apple'],
    },
  }),
  queryRuleCustomData({
    container: '#query-rule-custom-data',
    templates: {
      default: ({ items }, { html }) => html`
        ${items.map(
          (item) => html`
            <a href="${item.link}">
              <img src="${item.banner}" alt="${item.title}" />
            </a>
          `
        )}
      `,
    },
  }),
  createTabsWidget({
    container: '#tabs',
    tabs: [
      {
        title: 'Hits',
        widgetFactory: (container) =>
          hits({
            container,
            templates: {
              item: (hit, { html, components }) => html`
                <span class="Hit-label">
                  ${components.Highlight({ hit, attribute: 'name' })}
                </span>
                <span class="Hit-price">$${hit.price}</span>
              `,
            },
          }),
        secondaryWidgetFactory: (container) =>
          pagination({
            container,
            cssClasses: {
              root: 'Pagination',
            },
          }),
      },
      {
        title: 'InfiniteHits',
        widgetFactory: (container) =>
          infiniteHits({
            container,
            showPrevious: true,
            templates: {
              item: (hit, { html, components }) => html`
                <span class="Hit-label">
                  ${components.Highlight({ hit, attribute: 'name' })}
                </span>
                <span class="Hit-price">$${hit.price}</span>
              `,
            },
          }),
      },
    ],
  }),
  chat({
    container: '#chat',
    agentId: '7c2f6816-bfdb-46e9-a51f-9cb8e5fc9628',
    templates: {
      item: itemTemplate,
    },
  }),
]);

search.start();
