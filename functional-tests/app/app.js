/* global instantsearch */

var search = instantsearch({ // eslint-disable-line
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  urlSync: true
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#search-box',
    placeholder: 'Search for products',
    poweredBy: true
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats'
  })
);

search.addWidget(
  instantsearch.widgets.sortBySelector({
    container: '#sort-by-selector',
    indices: [
      {name: 'instant_search', label: 'Most relevant'},
      {name: 'instant_search_price_asc', label: 'Lowest price'},
      {name: 'instant_search_price_desc', label: 'Highest price'}
    ],
    cssClasses: {
      select: 'form-control'
    }
  })
);

search.addWidget(
  instantsearch.widgets.hitsPerPageSelector({
    container: '#hits-per-page-selector',
    options: [
      {value: 6, label: '6 per page'},
      {value: 12, label: '12 per page'},
      {value: 24, label: '24 per page'}
    ],
    cssClasses: {
      select: 'form-control'
    }
  })
);

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: document.querySelector('#empty').innerHTML,
      item: document.querySelector('#item').innerHTML
    },
    hitsPerPage: 6
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClasses: {
      root: 'pagination', // This uses Bootstrap classes
      active: 'active'
    },
    maxPages: 20
  })
);

search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear-all',
    autoHideContainer: false
  })
);

search.addWidget(
  instantsearch.widgets.currentRefinedValues({
    autoHideContainer: false,
    container: '#current-refined-values',
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value facet-value-removable',
      count: 'facet-count pull-right',
      clearAll: 'clear-all',
      item: 'item'
    },
    templates: {
      header: 'Current refinements'
    },
    attributes: [
      {
        name: 'price',
        label: 'Price',
        transformData: function(data) { data.name = data.name + ''; return data; }
      },
      {
        name: 'price_range',
        label: 'Price range',
        transformData: function(data) { data.name = data.name.replace(/(\d+)/g, '$$$1'); return data; }
      },
      {
        name: 'free_shipping',
        transformData: function(data) { if (data.name === 'true') data.name = 'Free shipping'; return data; }
      }
    ]
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    attributeName: 'brand',
    operator: 'or',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox item',
      count: 'facet-count pull-right',
      active: 'facet-active'
    },
    templates: {
      header: 'Brands'
    }
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
      {start: 10, name: 'more than 10'}
    ],
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active',
      item: 'item'
    },
    templates: {
      header: 'Price numeric list'
    }
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
      item: 'facet-value checkbox item',
      count: 'facet-count pull-right',
      active: 'facet-active'
    },
    templates: {
      header: 'Price ranges'
    },
    transformData: function(data) {
      data.name = data.name.replace(/(\d+) - (\d+)/, '$$$1 - $$$2').replace(/> (\d+)/, '> $$$1');
      return data;
    }
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
      active: 'facet-active'
    },
    templates: {
      header: 'Shipping'
    }
  })
);

search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    attributeName: 'categories',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active',
      item: 'item'
    },
    templates: {
      header: 'Categories'
    }
  })
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    attributeName: 'price',
    cssClasses: {
      header: 'facet-title'
    },
    templates: {
      header: 'Price'
    },
    step: 10,
    tooltips: {
      format: function(formattedValue) {
        return '$' + Math.round(formattedValue).toLocaleString();
      }
    }
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
      item: 'item'
    },
    templates: {
      header: 'Hierarchical categories'
    }
  })
);

search.once('render', function() {
  document.querySelector('.search').className = 'row search search--visible';
});

search.addWidget(
  instantsearch.widgets.priceRanges({
    container: '#price-ranges',
    attributeName: 'price',
    templates: {
      header: 'Price ranges'
    },
    cssClasses: {
      header: 'facet-title',
      body: 'nav nav-stacked',
      range: 'facet-value',
      form: '',
      input: 'fixed-input-sm',
      button: 'btn btn-default btn-sm',
      item: 'item'
    }
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
      {label: 'Top 500', value: 9501}
    ]
  })
);

search.start();
