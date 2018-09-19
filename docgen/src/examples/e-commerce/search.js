'use strict';
/* global instantsearch */

var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'ikea',
  routing: true
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#q',
    placeholder: 'Search a product'
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats'
  })
);

search.on('render', function() {
  $('.product-picture img').addClass('transparent');
  $('.product-picture img').one('load', function() {
      $(this).removeClass('transparent');
  }).each(function() {
      if(this.complete) $(this).load();
  });
});

var hitTemplate =
  '<article class="hit">' +
      '<div class="product-picture-wrapper">' +
        '<div class="product-picture"><img src="{{image}}" /></div>' +
      '</div>' +
      '<div class="product-desc-wrapper">' +
        '<div class="product-name">{{{_highlightResult.name.value}}}</div>' +
        '<div class="product-type">{{{_highlightResult.type.value}}}</div>' +
        '<div class="product-price">${{price}}</div>' +
        '<div class="product-rating">{{#stars}}<span class="ais-star-rating--star{{^.}}__empty{{/.}}"></span>{{/stars}}</div>' +
      '</div>' +
  '</article>';

var noResultsTemplate =
  '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';

var menuTemplate =
  '<a href="javascript:void(0);" class="facet-item {{#isRefined}}active{{/isRefined}}"><span class="facet-name"><i class="fa fa-angle-right"></i> {{label}}</span class="facet-name"></a>';

var facetTemplateCheckbox =
  '<a href="javascript:void(0);" class="facet-item">' +
    '<input type="checkbox" class="{{cssClasses.checkbox}}" value="{{label}}" {{#isRefined}}checked{{/isRefined}} />{{label}}' +
    '<span class="facet-count">({{count}})</span>' +
  '</a>';

var facetTemplateColors =
  '<a href="javascript:void(0);" data-facet-value="{{label}}" class="facet-color {{#isRefined}}checked{{/isRefined}}"></a>';

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    hitsPerPage: 16,
    templates: {
      empty: noResultsTemplate,
      item: hitTemplate
    },
    transformData: function(hit) {
      hit.stars = [];
      for (var i = 1; i <= 5; ++i) {
        hit.stars.push(i <= hit.rating);
      }
      return hit;
    }
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClasses: {
      active: 'active'
    },
    labels: {
      previous: '<i class="fa fa-angle-left fa-2x"></i> Previous page',
      next: 'Next page <i class="fa fa-angle-right fa-2x"></i>'
    },
    showFirst: false,
    showLast: false
  })
);

search.addWidget(
  instantsearch.widgets.hierarchicalMenu({
    container: '#categories',
    attributes: ['category', 'sub_category', 'sub_sub_category'],
    sortBy: ['name:asc'],
    templates: {
      item: menuTemplate
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#materials',
    attributeName: 'materials',
    operator: 'or',
    limit: 10,
    templates: {
      item: facetTemplateCheckbox,
      header: '<div class="facet-title">Materials</div class="facet-title">'
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#colors',
    attributeName: 'colors',
    operator: 'or',
    limit: 10,
    templates: {
      item: facetTemplateColors,
      header: '<div class="facet-title">Colors</div class="facet-title">'
    }
  })
);

search.addWidget(
  instantsearch.widgets.starRating({
    container: '#rating',
    attributeName: 'rating',
    templates: {
      header: '<div class="facet-title">Ratings</div class="facet-title">'
    }
  })
);

search.addWidget(
  instantsearch.widgets.priceRanges({
    container: '#prices',
    attributeName: 'price',
    cssClasses: {
      list: 'nav nav-list',
      count: 'badge pull-right',
      active: 'active'
    },
    templates: {
      header: '<div class="facet-title">Prices</div class="facet-title">'
    }
  })
);

search.addWidget(
  instantsearch.widgets.sortBy({
    container: '#sort-by',
    items: [
      {name: 'ikea', label: 'Featured'},
      {name: 'ikea_price_asc', label: 'Price asc.'},
      {name: 'ikea_price_desc', label: 'Price desc.'}
    ],
    label:'sort by'
  })
);

search.addWidget(
  instantsearch.widgets.clearAll({
    container: '#clear-all',
    templates: {
      link: '<i class="fa fa-eraser"></i> Clear all filters'
    },
    cssClasses: {
      root: 'btn btn-block btn-default'
    },
    autoHideContainer: true
  })
);

search.start();
