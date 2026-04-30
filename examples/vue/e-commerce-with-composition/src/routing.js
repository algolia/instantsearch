import { history as historyRouter } from 'instantsearch.js/es/lib/routers';

const routeStateDefaultValues = {
  query: '',
  page: '1',
  authors: undefined,
  types: undefined,
  labels: undefined,
};

const originalWindowTitle = document.title;

const router = historyRouter({
  cleanUrlOnDispose: false,
  windowTitle({ query }) {
    const queryTitle = query ? `Results for "${query}"` : '';

    return [queryTitle, originalWindowTitle].filter(Boolean).join(' | ');
  },

  createURL({ qsModule, routeState, location }) {
    const { protocol, hostname, port = '', pathname, hash } = location;
    const portWithPrefix = port === '' ? '' : `:${port}`;
    const urlParts = location.href.match(/^(.*?)\/search/);
    const baseUrl =
      (urlParts && urlParts[0]) ||
      `${protocol}//${hostname}${portWithPrefix}${pathname}search`;

    const queryParameters = {};

    if (
      routeState.query &&
      routeState.query !== routeStateDefaultValues.query
    ) {
      queryParameters.query = encodeURIComponent(routeState.query);
    }
    if (routeState.page && routeState.page !== routeStateDefaultValues.page) {
      queryParameters.page = routeState.page;
    }
    if (
      routeState.authors &&
      routeState.authors !== routeStateDefaultValues.authors
    ) {
      queryParameters.authors = routeState.authors.map(encodeURIComponent);
    }
    if (
      routeState.types &&
      routeState.types !== routeStateDefaultValues.types
    ) {
      queryParameters.types = routeState.types.map(encodeURIComponent);
    }
    if (
      routeState.labels &&
      routeState.labels !== routeStateDefaultValues.labels
    ) {
      queryParameters.labels = routeState.labels.map(encodeURIComponent);
    }

    const queryString = qsModule.stringify(queryParameters, {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    });

    return `${baseUrl}/${queryString}${hash}`;
  },

  parseURL({ qsModule, location }) {
    const queryParameters = qsModule.parse(location.search.slice(1));
    const {
      query = '',
      page = 1,
      authors = [],
      types = [],
      labels = [],
    } = queryParameters;
    // `qs` does not return an array when there's a single value.
    const allAuthors = Array.isArray(authors)
      ? authors
      : [authors].filter(Boolean);
    const allTypes = Array.isArray(types)
      ? types
      : [types].filter(Boolean);
    const allLabels = Array.isArray(labels)
      ? labels
      : [labels].filter(Boolean);

    return {
      query: decodeURIComponent(query),
      page,
      authors: allAuthors.map(decodeURIComponent),
      types: allTypes.map(decodeURIComponent),
      labels: allLabels.map(decodeURIComponent),
    };
  },
});

const getStateMapping = ({ indexName }) => ({
  stateToRoute(uiState) {
    const indexUiState = uiState[indexName];
    return {
      query: indexUiState.query,
      page: indexUiState.page,
      authors:
        indexUiState.refinementList && indexUiState.refinementList.author,
      types: indexUiState.refinementList && indexUiState.refinementList.type,
      labels: indexUiState.refinementList && indexUiState.refinementList.label,
    };
  },

  routeToState(routeState) {
    return {
      [indexName]: {
        query: routeState.query,
        page: routeState.page,
        refinementList: {
          author: routeState.authors,
          type: routeState.types,
          label: routeState.labels,
        },
      },
    };
  },
});

const getRouting = ({ indexName }) => ({
  router,
  stateMapping: getStateMapping({ indexName }),
});

export default getRouting;
