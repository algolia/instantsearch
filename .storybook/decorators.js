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
      hitsPerPage: 8,
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

  const playgroundElement = document.createElement('div');
  playgroundElement.classList.add('container', 'container-playground');
  containerElement.appendChild(playgroundElement);

  // Add the searchbox to the playground
  const searchBox = document.createElement('div');
  searchBox.className = 'searchBox';
  playgroundElement.appendChild(searchBox);

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: searchBox,
    })
  );

  // Add the hits to the playground
  const hits = document.createElement('div');
  hits.className = 'hits';
  playgroundElement.appendChild(hits);

  search.addWidget(
    instantsearch.widgets.hits({
      container: hits,
      templates: {
        item:
          '{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}',
      },
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
