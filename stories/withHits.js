import instantSearch from '../src/lib/main';

export const withHits = (fn, options = {}) => () => {
  const {
    appId = 'latency',
    apiKey = '6be0576ff61c053d5f9a3225e2a90f76',
    indexName = 'instant_search',
    searchParameters = {},
    ...instantSearchOptions
  } = options;

  const search = instantSearch({
    ...instantSearchOptions,
    appId,
    apiKey,
    indexName,
    searchParameters: {
      hitsPerPage: 3,
      ...searchParameters,
    },
  });

  const containerElement = document.createElement('div');
  containerElement.className = 'container';

  const playgroundElement = document.createElement('div');
  playgroundElement.className = 'playground';
  containerElement.appendChild(playgroundElement);

  const showcaseElement = document.createElement('div');
  showcaseElement.className = 'showcase';
  containerElement.appendChild(showcaseElement);

  // SearchBox
  const searchBox = document.createElement('div');
  searchBox.className = 'searchBox';
  showcaseElement.appendChild(searchBox);

  search.addWidget(
    instantSearch.widgets.searchBox({
      container: searchBox,
    })
  );

  // Hits
  const hits = document.createElement('div');
  hits.className = 'hits';
  showcaseElement.appendChild(hits);

  search.addWidget(
    instantSearch.widgets.hits({
      container: hits,
    })
  );

  fn({
    container: playgroundElement,
    instantSearch,
    search,
  });

  search.start();

  return containerElement;
};
