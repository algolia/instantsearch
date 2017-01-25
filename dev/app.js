/* eslint-disable import/default */

// force using index because package 'main' is dist-es5-module/
import instantsearch from '../index.js';
import allItems from './templates/all-items.html';
import empty from './templates/no-results.html';
import item from './templates/item.html';

const search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  urlSync: {
    useHash: !(window.history && 'pushState' in window.history),
    mapping: {
      q: 'query',
      hPP: 'hits',
      hFR: 'hierarchical',
    },
  },
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    poweredBy: true,
  })
);

search.addWidget(
  instantsearch.widgets.analytics({
    pushFunction(/* formattedParameters, state, results*/) {
      // Google Analytics
      // window.ga('set', 'page', '/search/query/?query=' + state.query + '&' + formattedParameters + '&numberOfHits=' + results.nbHits);
      // window.ga('send', 'pageView');

      // GTM
      // dataLayer.push({'event': 'search', 'Search Query': state.query, 'Facet Parameters': formattedParameters, 'Number of Hits': results.nbHits});

      // Segment.io
      // analytics.page( '[SEGMENT] instantsearch', { path: '/instantsearch/?query=' + state.query + '&' + formattedParameters });

      // Kissmetrics
      // var objParams = JSON.parse('{"' + decodeURI(formattedParameters.replace(/&/g, "\",\"").replace(/=/g,"\":\"")) + '"}');
      // var arrParams = $.map(objParams, function(value, index) {
      //   return [value];
      // });
      //
      // _kmq.push(['record', '[KM] Viewed Result page', {
      //   'Query': state.query ,
      //   'Number of Hits': results.nbHits,
      //   'Search Params': arrParams
      // }]);
    },
    triggerOnUIInteraction: true,
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats',
  })
);

search.addWidget(
  instantsearch.widgets.sortBySelector({
    container: '#sort-by-selector',
    indices: [
      {name: 'instant_search', label: 'Most relevant'},
      {name: 'instant_search_price_asc', label: 'Lowest price'},
      {name: 'instant_search_price_desc', label: 'Highest price'},
    ],
    cssClasses: {
      select: 'form-control',
    },
  })
);

search.addWidget(
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page-selector',
    options: [
      {value: 6, label: '6 per page'},
      {value: 12, label: '12 per page'},
      {value: 24, label: '24 per page'},
    ],
    cssClasses: {
      select: 'form-control',
    },
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits-table',
    templates: {
      empty,
      allItems,
    },
    hitsPerPage: 24,
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty,
      item,
    },
    hitsPerPage: 24,
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClasses: {
      root: 'pagination', // This uses Bootstrap classes
      active: 'active',
    },
    maxPages: 20,
  })
);

search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear-all',
    autoHideContainer: false,
  })
);

search.addWidget(
  instantsearch.widgets.currentRefinedValues({
    container: '#current-refined-values',
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value facet-value-removable',
      count: 'facet-count pull-right',
    },
    templates: {
      header: 'Current refinements',
    },
    attributes: [
      {
        name: 'price',
        label: 'Price',
        transformData: data => { data.name = `$${data.name}`; return data; },
      },
      {
        name: 'price_range',
        label: 'Price range',
        transformData: data => { data.name = data.name.replace(/(\d+)/g, '$$$1'); return data; },
      },
      {
        name: 'free_shipping',
        transformData: data => { if (data.name === 'true') data.name = 'Free shipping'; return data; },
      },
    ],
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#searchable-brands',
    attributeName: 'brand',
    operator: 'or',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Searchable brands',
    },
    searchForFacetValues: {
      placeholder: 'Find other brands...',
      templates: {
        noResults: 'No results',
      },
    },
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    collapsible: {
      collapsed: true,
    },
    container: '#brands',
    attributeName: 'brand',
    operator: 'or',
    limit: 3,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Brands with collapsible <span class="collapse-arrow"></span>',
    },
    showMore: {
      templates: {
        active: '<button>Show less</button>',
        inactive: '<button>Show more</button>',
      },
      limit: 10,
    },
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands-2',
    attributeName: 'brand',
    operator: 'or',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Brands',
    },
  })
);

search.addWidget(
  instantsearch.widgets.starRating({
    container: '#rating',
    attributeName: 'rating',
    max: 5,
    labels: {
      andUp: '& Up',
    },
    templates: {
      header: 'Rating',
    },
  })
);

search.addWidget(
  instantsearch.widgets.numericRefinementList({
    container: '#price-numeric-list',
    attributeName: 'price',
    operator: 'or',
    options: [
      {name: 'All'},
      {end: 4, name: 'less than 4'},
      {start: 4, end: 4, name: '4'},
      {start: 5, end: 10, name: 'between 5 and 10'},
      {start: 10, name: 'more than 10'},
    ],
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Price numeric list',
    },
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#price-range',
    attributeName: 'price_range',
    operator: 'and',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Price ranges',
    },
    transformData(data) {
      data.name = data.name.replace(/(\d+) - (\d+)/, '$$$1 - $$$2').replace(/> (\d+)/, '> $$$1');
      return data;
    },
  })
);

search.addWidget(
  instantsearch.widgets.toggle({
    container: '#free-shipping',
    attributeName: 'free_shipping',
    label: 'Free Shipping',
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Shipping',
    },
  })
);

search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    attributeName: 'categories',
    limit: 3,
    showMore: {
      templates: {
        active: '<button>Show less</button>',
        inactive: '<button>Show more</button>',
      },
      limit: 10,
    },
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active',
    },
    templates: {
      header: 'Categories',
    },
  })
);

function customMenuRender(opts, isFirstRendering) {
  const container = opts.containerNode;

  let input;
  if (isFirstRendering) {
    input = document.createElement('select');
    input.refine = opts.toggleRefinement;
    input.addEventListener('change', e => {
      input.refine(e.target.value);
    });
    container.innerHTML = '<div class="ais-toggle--header facet-title ais-header">Custom categories</div>';
    container.appendChild(input);
  } else {
    input = container.querySelector('select');
  }

  input.refine = opts.toggleRefinement;

  const facetValues = opts.facetValues;
  const facetOptions = facetValues.map(f => {
    const option = document.createElement('option');
    option.innerHTML = f.name;
    option.value = f.path;
    option.selected = f.isRefined;
    return option;
  });
  const isValueSelected = facetValues.find(f => f.isRefined);

  const noValue = document.createElement('option');
  noValue.value = '';
  noValue.innerHTML = '';
  noValue.selected = !isValueSelected;

  input.innerHTML = '';

  input.appendChild(noValue);
  if (facetOptions.length > 0) {
    facetOptions.forEach(o => {
      input.appendChild(o);
    });
  }
}

search.addWidget(
  instantsearch.widgets.menu({
    container: '#custom-categories',
    attributeName: 'categories',
    limit: 3,
  }).setCustomRender(customMenuRender)
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    attributeName: 'price',
    cssClasses: {
      header: 'facet-title',
    },
    templates: {
      header: 'Price',
    },
    max: 500,
    step: 10,
    tooltips: {
      format(rawValue) {
        return `$${Math.round(rawValue).toLocaleString()}`;
      },
    },
  })
);

search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#hierarchical-categories',
    attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
    cssClasses: {
      header: 'facet-title',
      list: 'hierarchical-categories-list',
      link: 'facet-value',
      count: 'facet-count pull-right',
    },
    rootPath: 'Cameras & Camcorders',
    templates: {
      header: 'Hierarchical categories',
    },
  })
);

search.addWidget(
  instantsearch.widgets.priceRanges({
    container: '#price-ranges',
    attributeName: 'price',
    templates: {
      header: 'Price ranges',
    },
    cssClasses: {
      header: 'facet-title',
      body: 'nav nav-stacked',
      range: 'facet-value',
      form: '',
      input: 'fixed-input-sm',
      button: 'btn btn-default btn-sm',
    },
  })
);

search.addWidget(
  instantsearch.widgets.numericSelector({
    container: '#popularity-selector',
    operator: '>=',
    attributeName: 'popularity',
    options: [
      {label: 'Default', value: 0},
      {label: 'Top 10', value: 9991},
      {label: 'Top 100', value: 9901},
      {label: 'Top 500', value: 9501},
    ],
  })
);

search.once('render', () => {
  [...document.querySelectorAll('.smooth-search--hidden')]
    .forEach(element => element.classList.remove('smooth-search--hidden'));
});

search.start();
