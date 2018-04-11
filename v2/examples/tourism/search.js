/* global instantsearch */

window.addEventListener('load', function() {
  var search = instantsearch({
    appId: 'latency',
    apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
    indexName: 'airbnb',
    routing: true
  });

  search.addWidget(
    instantsearch.widgets.searchBox({
      container: '#q',
      placeholder: 'Where are you going?',
      magnifier: false
    })
  );

  search.addWidget(
    instantsearch.widgets.stats({
      container: '#stats'
    })
  );

  var hitTemplate =
    '<div class="hit col-sm-3">' +
    '<div class="pictures-wrapper">' +
      '<img class="picture" src="{{picture_url}}" />' +
      '<img class="profile" src="{{user.user.thumbnail_url}}" />' +
    '</div>' +
    '<div class="infos">' +
    '<h4 class="media-heading">{{{_highlightResult.name.value}}}</h4>' +
    '<p>{{room_type}} - {{{_highlightResult.city.value}}}, {{{_highlightResult.country.value}}}</p>' +
    '</div>' +
    '</div>';

  var noResultsTemplate = '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>';

  search.addWidget(
    instantsearch.widgets.hits({
      container: '#hits',
      hitsPerPage: 12,
      templates: {
        empty: noResultsTemplate,
        item: hitTemplate
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.pagination({
      container: '#pagination',
      scrollTo: '#results',
      cssClasses: {
        root: 'pagination',
        active: 'active'
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.refinementList({
      container: '#room_types',
      attributeName: 'room_type',
      operator: 'or',
      cssClasses: {item: ['col-sm-3']},
      limit: 10,
      sortBy: ['name:asc']
    })
  );

  search.addWidget(
    instantsearch.widgets.rangeSlider({
      container: '#price',
      attributeName: 'price',
      pips: false,
      tooltips: {format: function(rawValue) {return '$' + parseInt(rawValue)}}
    })
    );

  search.addWidget(
    instantsearch.widgets.googleMaps({
      container: document.querySelector('#map'),
      prepareMarkerData: function(hit, index, hits) {
        return {
          title: hit.description
        };
      }
    })
  );

  search.addWidget(
    instantsearch.widgets.numericSelector({
      container: '#guests',
      attributeName: 'person_capacity',
      operator: '>=',
      options: [
        { label: '1 guest', value: 1},
        { label: '2 guests', value: 2},
        { label: '3 guests', value: 3},
        { label: '4 guests', value: 4},
        { label: '5 guests', value: 5},
        { label: '6 guests', value: 6}
      ]
    })
  );

  search.start();
});
