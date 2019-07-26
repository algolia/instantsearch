import { action } from '@storybook/addon-actions';
import algoliasearch from 'algoliasearch/lite';
import { MemoryRouter } from '../MemoryRouter';
import instantsearch from '../../src/index';
import defaultPlayground from '../playgrounds/default';

export const withHits = (
  storyFn: ({
    container,
    instantsearch,
    search,
  }: {
    container: HTMLElement;
    instantsearch: any;
    search: any;
  }) => void,
  searchOptions?: any
) => () => {
  const {
    appId = 'latency',
    apiKey = '6be0576ff61c053d5f9a3225e2a90f76',
    indexName = 'instant_search',
    searchParameters = {},
    playground = defaultPlayground,
    ...instantsearchOptions
  } = searchOptions || {};

  // const urlLogger = action('Routing state');
  const search = instantsearch({
    indexName,
    searchClient: algoliasearch(appId, apiKey),
    // searchParameters: {},
    routing: {
      router: new MemoryRouter({
        // eslint-disable-next-line @typescript-eslint/camelcase
        instant_search: {
          query: 'phone',
          refinementList: {
            brand: ['Sony', 'GE'],
          },
          // configure: {
          //   hitsPerPage: 4,
          //   attributesToSnippet: ['description:15'],
          //   snippetEllipsisText: '[…]',
          // },
        },
        // eslint-disable-next-line @typescript-eslint/camelcase
        instant_search_price_asc: {
          // configure: {
          //   hitsPerPage: 1,
          // },
          // menu: {
          //   categories: 'Computers & Tablets',
          // },
        },
      }),
    },
    ...instantsearchOptions,
  });

  search.addWidget(
    instantsearch.widgets.configure({
      hitsPerPage: 4,
      attributesToSnippet: ['description:15'],
      snippetEllipsisText: '[…]',
      ...searchParameters,
    })
  );

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

  playground({
    search,
    leftPanel: leftPanelPlaygroundElement,
    rightPanel: rightPanelPlaygroundElement,
  });

  storyFn({
    container: previewElement,
    instantsearch,
    search,
  });

  search.start();

  return containerElement;
};
