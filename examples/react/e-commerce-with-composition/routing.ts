import { history as historyRouter } from 'instantsearch.js/es/lib/routers';

import type { UiState } from 'instantsearch.js';

type RouteState = {
  query?: string;
  page?: string;
  authors?: string[];
  types?: string[];
  labels?: string[];
};

const routeStateDefaultValues: RouteState = {
  query: '',
  page: '1',
  authors: undefined,
  types: undefined,
  labels: undefined,
};

const originalWindowTitle = document.title;

const router = historyRouter<RouteState>({
  cleanUrlOnDispose: false,
  windowTitle({ query }) {
    const queryTitle = query ? `Results for "${query}"` : '';

    return [queryTitle, originalWindowTitle].filter(Boolean).join(' | ');
  },

  createURL({ qsModule, routeState, location }): string {
    const { protocol, hostname, port = '', pathname, hash } = location;
    const portWithPrefix = port === '' ? '' : `:${port}`;
    const urlParts = location.href.match(/^(.*?)\/search/);
    const baseUrl =
      (urlParts && urlParts[0]) ||
      `${protocol}//${hostname}${portWithPrefix}${pathname}search`;

    const queryParameters: Partial<RouteState> = {};

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

  parseURL({ qsModule, location }): RouteState {
    const queryParameters = qsModule.parse(location.search.slice(1));
    const {
      query = '',
      page = 1,
      authors = [],
      types = [],
      labels = [],
    } = queryParameters;

    const allAuthors = (
      Array.isArray(authors) ? authors : [authors].filter(Boolean)
    ) as string[];
    const allTypes = (
      Array.isArray(types) ? types : [types].filter(Boolean)
    ) as string[];
    const allLabels = (
      Array.isArray(labels) ? labels : [labels].filter(Boolean)
    ) as string[];

    return {
      query: decodeURIComponent(query as string),
      page: page as string,
      authors: allAuthors.map(decodeURIComponent),
      types: allTypes.map(decodeURIComponent),
      labels: allLabels.map(decodeURIComponent),
    };
  },
});

const getStateMapping = ({ indexName }: { indexName: string }) => ({
  stateToRoute(uiState: UiState): RouteState {
    const indexUiState = uiState[indexName];
    return {
      query: indexUiState.query,
      page: (indexUiState.page && String(indexUiState.page)) || undefined,
      authors:
        indexUiState.refinementList && indexUiState.refinementList.author,
      types: indexUiState.refinementList && indexUiState.refinementList.type,
      labels: indexUiState.refinementList && indexUiState.refinementList.label,
    };
  },

  routeToState(routeState: RouteState): UiState {
    const refinementList: { [key: string]: string[] } = {};
    if (routeState.authors) {
      refinementList.author = routeState.authors;
    }
    if (routeState.types) {
      refinementList.type = routeState.types;
    }
    if (routeState.labels) {
      refinementList.label = routeState.labels;
    }

    return {
      [indexName]: {
        query: routeState.query,
        page: Number(routeState.page),
        refinementList,
      },
    };
  },
});

const getRouting = (indexName: string) => ({
  router,
  stateMapping: getStateMapping({ indexName }),
});

export default getRouting;
