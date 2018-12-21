import { action } from '@storybook/addon-actions';
import algoliasearch from 'algoliasearch/lite';
import instantsearch from '../src/index';

export const withHits = (storyFn, searchOptions = {}) => () => {
  const {
    appId = 'latency',
    apiKey = '6be0576ff61c053d5f9a3225e2a90f76',
    indexName = 'instant_search',
    searchParameters = {},
    ...instantsearchOptions
  } = searchOptions;

  const urlLogger = action('Routing state');
  const search = instantsearch({
    indexName,
    searchClient: algoliasearch(appId, apiKey),
    searchParameters: {
      hitsPerPage: 4,
      attributesToSnippet: ['description:15'],
      snippetEllipsisText: '[…]',
      ...searchParameters,
    },
    routing: {
      router: {
        write: routeState => {
          urlLogger(JSON.stringify(routeState, null, 2));
        },
        read: () => ({}),
        createURL: () => '',
        onUpdate: () => {},
      },
    },
    ...instantsearchOptions,
  });

  const containerElement = document.createElement('div');

  // Add the preview container to add the stories in
  const previewElement = document.createElement('div');
  previewElement.classList.add('container', 'container-preview');
  containerElement.appendChild(previewElement);

  // Add the playground container to add widgets into
  const playgroundElement = document.createElement('div');
  playgroundElement.classList.add('container', 'container-playground');
  containerElement.appendChild(playgroundElement);

  const leftPanelPlaygroundElement = document.createElement('div');
  leftPanelPlaygroundElement.classList.add('panel-left');
  playgroundElement.appendChild(leftPanelPlaygroundElement);

  const rightPanelPlaygroundElement = document.createElement('div');
  rightPanelPlaygroundElement.classList.add('panel-right');
  playgroundElement.appendChild(rightPanelPlaygroundElement);

  // Add widgets to the playground
  const refinementList = document.createElement('div');
  leftPanelPlaygroundElement.appendChild(refinementList);

  const brandList = instantsearch.widgets.panel({
    templates: {
      header: 'Brands',
    },
  })(instantsearch.widgets.refinementList);

  search.addWidget(
    brandList({
      container: refinementList,
      attribute: 'brand',
    })
  );

  const numericMenu = document.createElement('div');
  leftPanelPlaygroundElement.appendChild(numericMenu);

  const priceMenu = instantsearch.widgets.panel({
    templates: {
      header: 'Price',
    },
  })(instantsearch.widgets.numericMenu);

  search.addWidget(
    priceMenu({
      container: numericMenu,
      attribute: 'price',
      items: [
        { label: 'All' },
        { label: '≤ 10$', end: 10 },
        { label: '10–100$', start: 10, end: 100 },
        { label: '100–500$', start: 100, end: 500 },
        { label: '≥ 500$', start: 500 },
      ],
    })
  );

  const ratingMenu = document.createElement('div');
  leftPanelPlaygroundElement.appendChild(ratingMenu);

  const ratingList = instantsearch.widgets.panel({
    templates: {
      header: 'Rating',
    },
  })(instantsearch.widgets.ratingMenu);

  search.addWidget(
    ratingList({
      container: ratingMenu,
      attribute: 'rating',
    })
  );

  const searchBox = document.createElement('div');
  searchBox.classList.add('searchbox');
  rightPanelPlaygroundElement.appendChild(searchBox);

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: searchBox,
      placeholder: 'Search here…',
    })
  );

  const stats = document.createElement('div');
  stats.classList.add('stats');
  rightPanelPlaygroundElement.appendChild(stats);

  search.addWidget(
    instantsearch.widgets.stats({
      container: stats,
    })
  );

  const hits = document.createElement('div');
  hits.classList.add('hits');
  rightPanelPlaygroundElement.appendChild(hits);

  search.addWidget(
    instantsearch.widgets.hits({
      container: hits,
      templates: {
        item: `
<div
  class="hits-image"
  style="background-image: url({{image}})"
></div>
<article>
  <header>
    <strong>{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</strong>
  </header>
  <p>
    {{#helpers.snippet}}{ "attribute": "description" }{{/helpers.snippet}}
  </p>
  <footer>
    <p>
      <strong>{{price}}$</strong>
    </p>
  </footer>
</article>
          `,
      },
      cssClasses: {
        item: 'hits-item',
      },
    })
  );

  const pagination = document.createElement('div');
  rightPanelPlaygroundElement.appendChild(pagination);

  search.addWidget(
    instantsearch.widgets.pagination({
      container: pagination,
    })
  );

  storyFn({
    container: previewElement,
    instantsearch,
    search,
  });

  search.start();

  return containerElement;
};
