/* global instantsearch */

var search = instantsearch({
  appId: 'latency',
  apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
  indexName: 'airbnb'
});

search.addWidget(
  instantsearch.widgets.searchBox({
    container: '#q'
  })
);

search.addWidget(
  instantsearch.widgets.stats({
    container: '#stats'
  })
);

var hitTemplate =
  '<div class="hit col-sm-6">' +
    '<img src="{{picture_url}}" /><br />' +
    '<div class="infos">' +
      '<h4 class="media-heading">{{{_highlightResult.name.value}}}</h4>' +
      '<p>{{room_type}} - {{{_highlightResult.city.value}}}, {{{_highlightResult.country.value}}}</p>' +
    '</div>' +
  '</div>';

var noResultsTemplate =
  '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';

search.addWidget(
  instantsearch.widgets.hits({
    container: '#hits',
    hitsPerPage: 10,
    templates: {
      empty: noResultsTemplate,
      item: hitTemplate
    }
  })
);

search.addWidget(
  instantsearch.widgets.pagination({
    container: '#pagination',
    cssClasses: {
      root: 'pagination',
      active: 'active'
    }
  })
);

search.addWidget(
  instantsearch.widgets.refinementList({
    container: '#room_types',
    facetName: 'room_type',
    operator: 'or',
    limit: 10
  })
);

search.addWidget(
  instantsearch.widgets.rangeSlider({
    container: '#price',
    attributeName: 'price',
    pips: false
  })
);

search.addWidget(
  instantsearch.widgets.googleMaps({
    container: document.querySelector('#map')
  })
);

search.addWidget(
  instantsearch.widgets.numericSelector({
    container: '#guests',
    attributeName: 'person_capacity',
    operator: '>=',
    options: [
      { label: '1 guest', value: 1 },
      { label: '2 guests', value: 2 },
      { label: '3 guests', value: 3 },
      { label: '4 guests', value: 4 },
      { label: '5 guests', value: 5 },
      { label: '6 guests', value: 6 }
    ]
  })
);

search.start();
