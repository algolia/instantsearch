// force using index because package 'main' is dist-es5-module/
var instantsearch = require('../index');

var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search',
  urlSync: {
    useHash: true
  }
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
  instantsearch.widgets.indexSelector({
    container: '#index-selector',
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
      empty: require('./templates/no-results.html'),
      item: require('./templates/item.html')
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
  instantsearch.widgets.refinementList({
    container: '#brands',
    facetName: 'brand',
    operator: 'or',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
      count: 'facet-count pull-right',
      active: 'facet-active'
    },
    templates: {
      header: 'Brands'
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#price-range',
    facetName: 'price_range',
    operator: 'and',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      item: 'facet-value checkbox',
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
    facetName: 'free_shipping',
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
    facetName: 'categories',
    limit: 10,
    cssClasses: {
      header: 'facet-title',
      link: 'facet-value',
      count: 'facet-count pull-right',
      active: 'facet-active'
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
      count: 'facet-count pull-right'
    },
    templates: {
      header: 'Hierarchical categories'
    }
  })
);

search.once('render', function() {
  document.querySelector('.search').className = 'row search search--visible';
});

<<<<<<< HEAD
=======
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
      button: 'btn btn-default btn-sm'
    }
  })
);

>>>>>>> f209f5d... fix(numerical widgets): s/facetName/attributeName
search.start();
