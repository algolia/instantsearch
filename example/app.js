// force using index because package 'main' is dist/
var instantsearch = require('../index');

var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'instant_search'
});
search.templatesConfig.options.sectionTags = [{o: '_refined', c: 'refined'}];

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

// search.addWidget(
//   instantsearch.widgets.stats({
//     container: '#stats'
//   })
// );

// search.addWidget(
//   instantsearch.widgets.indexSelector({
//     container: '#index-selector',
//     indices: [
//       {name: 'instant_search', label: 'Most relevant'},
//       {name: 'instant_search_price_asc', label: 'Lowest price'},
//       {name: 'instant_search_price_desc', label: 'Highest price'}
//     ],
//     cssClass: 'form-control'
//   })
// );

// search.addWidget(
//   instantsearch.widgets.hits({
//     container: '#hits',
//     templates: {
//       empty: require('./templates/no-results.html'),
//       hit: require('./templates/hit.html')
//     },
//     hitsPerPage: 6
//   })
// );

// search.addWidget(
//   instantsearch.widgets.pagination({
//     container: '#pagination',
//     cssClass: 'pagination',
//     maxPages: 20
//   })
// );

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#brands',
    facetName: 'brand',
    operator: 'or',
    limit: 10,
    cssClasses: {
      list: 'nav nav-stacked panel-body'
    },
    templates: {
      header: '<div class="panel-heading">Brands</div>',
      item: require('./templates/or.html')
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
      root: 'list-group'
    },
    templates: {
      header: '<div class="panel-heading">Price ranges</div>',
      item: require('./templates/and.html')
    },
    transformData: function(data) {
      data.name = data.name.replace(/(\d+) - (\d+)/, '$$$1 - $$$2').replace(/> (\d+)/, '> $$$1');
      return data;
    }
  })
);

// search.addWidget(
//   instantsearch.widgets.toggle({
//     container: '#free-shipping',
//     facetName: 'free_shipping',
//     label: 'Free Shipping',
//     templates: {
//       header: '<div class="panel-heading">Shipping</div>',
//       body: require('./templates/free-shipping.html')
//     },
//     transformData: function(data) {
//       data._refined = data.isRefined;
//       return data;
//     }
//   })
// );

// search.addWidget(
//   instantsearch.widgets.menu({
//     container: '#categories',
//     facetName: 'categories',
//     limit: 10,
//     cssClasses: {
//       root: 'list-group'
//     },
//     templates: {
//       header: '<div class="panel-heading">Categories</div>',
//       item: require('./templates/category.html')
//     }
//   })
// );

// search.addWidget(
//   instantsearch.widgets.rangeSlider({
//     container: '#price',
//     facetName: 'price',
//     cssClasses: {
//       body: 'panel-body'
//     },
//     templates: {
//       header: '<div class="panel-heading">Price</div>'
//     },
//     tooltips: {
//       format: function(formattedValue) {
//         return '$' + formattedValue;
//       }
//     }
//   })
// );

search.start();
