/* global instantsearch algoliasearch $script */

$script(
  'https://maps.googleapis.com/maps/api/js?v=weekly&key=AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ',
  function() {
    var search = instantsearch({
      searchClient: algoliasearch(
        'latency',
        '6be0576ff61c053d5f9a3225e2a90f76'
      ),
      indexName: 'airbnb',
      routing: true,
    });

    search.addWidgets([
      instantsearch.widgets.configure({
        aroundLatLngViaIP: true,
        hitsPerPage: 12,
      }),

      instantsearch.widgets.searchBox({
        container: '#search-box',
        placeholder: 'Where are you going?',
        showSubmit: false,
        cssClasses: {
          input: 'form-control',
        },
      }),

      instantsearch.widgets.stats({
        container: '#stats',
      }),

      instantsearch.widgets.hits({
        container: '#hits',
        templates: {
          item:
            '<div class="hit col-sm-3">' +
            '<div class="pictures-wrapper">' +
            '<img class="picture" src="{{picture_url}}" />' +
            '<img class="profile" src="{{user.user.thumbnail_url}}" />' +
            '</div>' +
            '<div class="infos">' +
            '<h4 class="media-heading">{{#helpers.highlight}}{ "attribute": "name" }{{/helpers.highlight}}</h4>' +
            '<p>' +
            '{{room_type}} - ' +
            '{{#helpers.highlight}}{ "attribute": "city" }{{/helpers.highlight}},' +
            '{{#helpers.highlight}}{ "attribute": "country" }{{/helpers.highlight}}' +
            '</p>' +
            '</div>' +
            '</div>',
          empty:
            '<div class="text-center">No results found matching <strong>{{query}}</strong>.</div>',
        },
      }),

      instantsearch.widgets.pagination({
        container: '#pagination',
        scrollTo: '#results',
        cssClasses: {
          list: 'pagination',
          selectedItem: 'active',
        },
      }),

      instantsearch.widgets.refinementList({
        container: '#room_types',
        attribute: 'room_type',
        sortBy: ['name:asc'],
        cssClasses: {
          item: ['col-sm-3'],
        },
      }),

      instantsearch.widgets.rangeSlider({
        container: '#price',
        attribute: 'price',
        pips: false,
        tooltips: {
          format: function(rawValue) {
            return '$' + parseInt(rawValue);
          },
        },
      }),

      instantsearch.widgets.geoSearch({
        container: '#map',
        googleReference: window.google,
        enableRefineControl: false,
        builtInMarker: {
          createOption: function(hit) {
            return {
              title: hit.description,
            };
          },
        },
      }),
    ]);

    search.start();
  }
);
