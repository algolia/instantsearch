/* eslint-disable camelcase */
/* eslint-disable complexity */
import { historyRouter } from 'instantsearch-core';

const hitsPerPageItemsValue = [16, 32, 64];

function getFallbackHitsPerPageRoutingValue(hitsPerPageValue) {
  if (hitsPerPageItemsValue.indexOf(Number(hitsPerPageValue)) !== -1) {
    return hitsPerPageValue;
  }

  return undefined;
}

const sortByItemsValue = [
  'instant_search',
  'instant_search_price_asc',
  'instant_search_price_desc',
];

function getFallbackSortByRoutingValue(sortByValue) {
  if (sortByItemsValue.indexOf(sortByValue) !== -1) {
    return sortByValue;
  }

  return undefined;
}

function getFallbackRatingsRoutingValue(value) {
  const ratingValue = Number(value);

  if (ratingValue >= 1 && ratingValue <= 4) {
    return value;
  }

  return undefined;
}

const routeStateDefaultValues = {
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
};

const decodedCategories = Object.keys(encodedCategories).reduce((acc, key) => {
  const newKey = encodedCategories[key];
  const newValue = key;

  return {
    ...acc,
    [newKey]: newValue,
  };
}, {});

// Returns a slug from the category name.
// Spaces are replaced by "+" to make
// the URL easier to read and other
// characters are encoded.
function getCategorySlug(name) {
  const encodedName = decodedCategories[name] || name;

  return encodedName.split(' ').map(encodeURIComponent).join('+');
}

// Returns a name from the category slug.
// The "+" are replaced by spaces and other
// characters are decoded.
function getCategoryName(slug) {
  const decodedSlug = encodedCategories[slug] || slug;

  return decodedSlug.split('+').map(decodeURIComponent).join(' ');
}

const originalWindowTitle = document.title;

const router = historyRouter({
  windowTitle({ category, query }) {
    const queryTitle = query ? `Results for "${query}"` : '';

    return [queryTitle, category, originalWindowTitle]
      .filter(Boolean)
      .join(' | ');
  },

  createURL({ qsModule, routeState, currentURL }) {
    const { protocol, hostname, port = '', pathname, hash } = currentURL;
    const portWithPrefix = port === '' ? '' : `:${port}`;
    const urlParts = currentURL.href.match(/^(.*?)\/search/);
    const baseUrl =
      (urlParts && urlParts[0]) ||
      `${protocol}//${hostname}${portWithPrefix}${pathname}search`;

    const categoryPath = routeState.category
      ? `${getCategorySlug(routeState.category)}/`
      : '';
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

  parseURL({ qsModule, currentURL }) {
    const pathnameMatches = currentURL.pathname.match(/search\/(.*?)\/?$/);
    const category = getCategoryName(
      (pathnameMatches && pathnameMatches[1]) || ''
    );
    const queryParameters = qsModule.parse(currentURL.search, {
      ignoreQueryPrefix: true,
    });
    const {
      query = '',
      page = 1,
      brands = [],
      price,
      free_shipping,
    } = queryParameters;
    // `qs` does not return an array when there's a single value.
    const allBrands = Array.isArray(brands) ? brands : [brands].filter(Boolean);
    const hitsPerPage = getFallbackHitsPerPageRoutingValue(
      queryParameters.hitsPerPage
    );
    const sortBy = getFallbackSortByRoutingValue(queryParameters.sortBy);
    const rating = getFallbackRatingsRoutingValue(queryParameters.rating);

    return {
      query: decodeURIComponent(query),
      page,
      brands: allBrands.map(decodeURIComponent),
      category,
      rating,
      price,
      free_shipping,
      sortBy,
      hitsPerPage,
    };
  },
});

const getStateMapping = ({ indexName }) => ({
  stateToRoute(uiState) {
    const indexUiState = uiState[indexName];
    return {
      query: indexUiState.query,
      page: indexUiState.page,
      brands: indexUiState.refinementList && indexUiState.refinementList.brand,
      category:
        indexUiState.hierarchicalMenu &&
        indexUiState.hierarchicalMenu['hierarchicalCategories.lvl0'] &&
        indexUiState.hierarchicalMenu['hierarchicalCategories.lvl0'].join('/'),
      rating: indexUiState.ratingMenu && String(indexUiState.ratingMenu.rating),
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

  routeToState(routeState) {
    return {
      [indexName]: {
        query: routeState.query,
        page: routeState.page,
        hierarchicalMenu: {
          'hierarchicalCategories.lvl0':
            (routeState.category && routeState.category.split('/')) ||
            undefined,
        },
        refinementList: {
          brand: routeState.brands,
        },
        ratingMenu: {
          rating: Number(routeState.rating),
        },
        range: {
          price: routeState.price,
        },
        toggle: {
          free_shipping: Boolean(routeState.free_shipping),
        },
        sortBy: routeState.sortBy,
        hitsPerPage: Number(routeState.hitsPerPage),
      },
    };
  },
});

const getRouting = ({ indexName }) => ({
  router,
  stateMapping: getStateMapping({ indexName }),
});

export default getRouting;
