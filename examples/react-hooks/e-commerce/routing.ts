/* eslint complexity: off */

import type { UiState } from 'instantsearch.js';
import { history as historyRouter } from 'instantsearch.js/es/lib/routers';

type RouteState = {
  query?: string;
  page?: string;
  brands?: string[];
  category?: string;
  rating?: string;
  price?: string;
  free_shipping?: string;
  sortBy?: string;
  hitsPerPage?: string;
};

const routeStateDefaultValues: RouteState = {
  query: '',
  page: '1',
  brands: undefined,
  category: '',
  rating: '',
  price: '',
  free_shipping: 'false',
  sortBy: 'instant_search',
  hitsPerPage: '20',
};

const encodedCategories = {
  Cameras: 'Cameras & Camcorders',
  Cars: 'Car Electronics & GPS',
  Phones: 'Cell Phones',
  TV: 'TV & Home Theater',
} as const;

type EncodedCategories = typeof encodedCategories;
type DecodedCategories = {
  [K in keyof EncodedCategories as EncodedCategories[K]]: K;
};

const decodedCategories = Object.keys(
  encodedCategories
).reduce<DecodedCategories>((acc, key) => {
  const newKey = encodedCategories[key as keyof EncodedCategories];
  const newValue = key;

  return {
    ...acc,
    [newKey]: newValue,
  };
}, {} as any);

// Returns a slug from the category name.
// Spaces are replaced by "+" to make
// the URL easier to read and other
// characters are encoded.
function getCategorySlug(name: string): string {
  const encodedName =
    decodedCategories[name as keyof DecodedCategories] || name;

  return encodedName.split(' ').map(encodeURIComponent).join('+');
}

// Returns a name from the category slug.
// The "+" are replaced by spaces and other
// characters are decoded.
function getCategoryName(slug: string): string {
  const decodedSlug =
    encodedCategories[slug as keyof EncodedCategories] || slug;

  return decodeURIComponent(decodedSlug.replace(/\+/g, ' '));
}

const originalWindowTitle = document.title;

const router = historyRouter<RouteState>({
  windowTitle({ category, query }) {
    const queryTitle = query ? `Results for "${query}"` : '';

    return [queryTitle, category, originalWindowTitle]
      .filter(Boolean)
      .join(' | ');
  },

  createURL({ qsModule, routeState, location }): string {
    const { protocol, hostname, port = '', pathname, hash } = location;
    const portWithPrefix = port === '' ? '' : `:${port}`;
    const urlParts = location.href.match(/^(.*?)\/search/);
    const baseUrl =
      (urlParts && urlParts[0]) ||
      `${protocol}//${hostname}${portWithPrefix}${pathname}search`;

    const categoryPath = routeState.category
      ? `${getCategorySlug(routeState.category)}/`
      : '';
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
      routeState.brands &&
      routeState.brands !== routeStateDefaultValues.brands
    ) {
      queryParameters.brands = routeState.brands.map(encodeURIComponent);
    }
    if (
      routeState.rating &&
      routeState.rating !== routeStateDefaultValues.rating
    ) {
      queryParameters.rating = routeState.rating;
    }
    if (
      routeState.price &&
      routeState.price !== routeStateDefaultValues.price
    ) {
      queryParameters.price = routeState.price;
    }
    if (
      routeState.free_shipping &&
      routeState.free_shipping !== routeStateDefaultValues.free_shipping
    ) {
      queryParameters.free_shipping = routeState.free_shipping;
    }
    if (
      routeState.sortBy &&
      routeState.sortBy !== routeStateDefaultValues.sortBy
    ) {
      queryParameters.sortBy = routeState.sortBy;
    }
    if (
      routeState.hitsPerPage &&
      routeState.hitsPerPage !== routeStateDefaultValues.hitsPerPage
    ) {
      queryParameters.hitsPerPage = routeState.hitsPerPage;
    }

    const queryString = qsModule.stringify(queryParameters, {
      addQueryPrefix: true,
      arrayFormat: 'repeat',
    });

    return `${baseUrl}/${categoryPath}${queryString}${hash}`;
  },

  parseURL({ qsModule, location }): RouteState {
    const pathnameMatches = location.pathname.match(/search\/(.*?)\/?$/);
    const category = getCategoryName(
      (pathnameMatches && pathnameMatches[1]) || ''
    );

    const queryParameters = qsModule.parse(location.search.slice(1));
    const {
      query = '',
      page = 1,
      brands = [],
      price,
      free_shipping,
      hitsPerPage,
      sortBy,
      rating,
    } = queryParameters;

    // `qs` does not return an array when there's a single value.
    const allBrands = (
      Array.isArray(brands) ? brands : [brands].filter(Boolean)
    ) as string[];

    return {
      category,
      query: decodeURIComponent(query as string),
      page: page as string,
      brands: allBrands.map(decodeURIComponent),
      rating: rating as string,
      price: price as string,
      free_shipping: free_shipping as string,
      sortBy: sortBy as string,
      hitsPerPage: hitsPerPage as string,
    };
  },
});

const getStateMapping = ({ indexName }: { indexName: string }) => ({
  stateToRoute(uiState: UiState): RouteState {
    const indexUiState = uiState[indexName];
    return {
      query: indexUiState.query,
      page: (indexUiState.page && String(indexUiState.page)) || undefined,
      brands: indexUiState.refinementList && indexUiState.refinementList.brand,
      category:
        indexUiState.hierarchicalMenu &&
        indexUiState.hierarchicalMenu['hierarchicalCategories.lvl0'] &&
        indexUiState.hierarchicalMenu['hierarchicalCategories.lvl0'].join('/'),
      rating:
        (indexUiState.ratingMenu &&
          indexUiState.ratingMenu.rating &&
          String(indexUiState.ratingMenu.rating)) ||
        undefined,
      price: indexUiState.range && indexUiState.range.price,
      free_shipping:
        (indexUiState.toggle && String(indexUiState.toggle.free_shipping)) ||
        undefined,
      sortBy: indexUiState.sortBy,
      hitsPerPage:
        (indexUiState.hitsPerPage && String(indexUiState.hitsPerPage)) ||
        undefined,
    };
  },

  routeToState(routeState: RouteState): UiState {
    const hierarchicalMenu: { [key: string]: string[] } = {};
    if (routeState.category) {
      hierarchicalMenu['hierarchicalCategories.lvl0'] =
        routeState.category.split('/');
    }

    const refinementList: { [key: string]: string[] } = {};
    if (routeState.brands) {
      refinementList.brand = routeState.brands;
    }

    const range: { [key: string]: string } = {};
    if (routeState.price) {
      range.price = routeState.price;
    }

    return {
      [indexName]: {
        query: routeState.query,
        page: Number(routeState.page),
        hierarchicalMenu,
        refinementList,
        ratingMenu: {
          rating: Number(routeState.rating),
        },
        range,
        toggle: {
          free_shipping: Boolean(routeState.free_shipping),
        },
        sortBy: routeState.sortBy,
        hitsPerPage: Number(routeState.hitsPerPage),
      },
    };
  },
});

const getRouting = (indexName: string) => ({
  router,
  stateMapping: getStateMapping({ indexName }),
});

export default getRouting;
