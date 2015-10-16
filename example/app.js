// force using index because package 'main' is dist/
var instantsearch = require('../index');

var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search'
});

search.addWidget(
  instantsearch.widgets.urlSync({
    useHash: true
  })
);

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
  instantsearch.widgets.hits({
    container: '#hits',
    templates: {
      empty: require('./templates/no-results.html'),
      hit: require('./templates/hit.html')
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
      header: 'panel-heading',
      list: 'nav nav-stacked panel-body',
      item: 'checkbox',
      count: 'badge pull-right'
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
      header: 'panel-heading',
      root: 'list-group'
    },
    templates: {
      header: 'Price ranges',
      item: require('./templates/and.html')
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
      header: 'panel-heading'
    },
    templates: {
      header: 'Shipping',
      body: require('./templates/free-shipping.html')
    }
  })
);

search.addWidget(
  instantsearch.widgets.menu({
    container: '#categories',
    facetName: 'categories',
    limit: 10,
    cssClasses: {
      header: 'panel-heading',
      root: 'list-group'
    },
    templates: {
      header: 'Categories',
      item: require('./templates/category.html')
    }
  })
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    facetName: 'price',
    cssClasses: {
      header: 'panel-heading',
      body: 'panel-body'
    },
    templates: {
      header: 'Price'
    },
    tooltips: {
      format: function(formattedValue) {
        return '$' + formattedValue;
      }
    }
  })
);

search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#hierarchical-categories',
    attributes: ['hierarchicalCategories.lvl0', 'hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2'],
    cssClasses: {
      root: 'list-group',
      header: 'panel-heading',
      list: 'hierarchical-categories-list'
    },
    templates: {
      header: 'Hierarchical categories',
      item: require('./templates/category.html')
    }
  })
);

search.once('render', function() {
  document.querySelector('.search').className = 'row search search--visible';
});

search.start();
