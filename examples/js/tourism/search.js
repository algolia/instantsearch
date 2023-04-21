import algoliasearch from 'algoliasearch/lite';
import instantsearch from 'instantsearch.js';
import {
  configure,
  searchBox,
  stats,
  hits,
  pagination,
  refinementList,
  rangeSlider,
  geoSearch,
} from 'instantsearch.js/es/widgets';

const search = instantsearch({
  searchClient: algoliasearch('latency', '6be0576ff61c053d5f9a3225e2a90f76'),
  indexName: 'airbnb',
  routing: true,
  insights: true,
});

search.addWidgets([
  configure({
    aroundLatLngViaIP: true,
    hitsPerPage: 12,
  }),

  searchBox({
    container: '#search-box',
    placeholder: 'Where are you going?',
    showSubmit: false,
    cssClasses: {
      input: 'form-control',
    },
  }),

  stats({
    container: '#stats',
  }),

  hits({
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

  pagination({
    container: '#pagination',
    scrollTo: '#results',
    cssClasses: {
      list: 'pagination',
      selectedItem: 'active',
    },
  }),

  refinementList({
    container: '#room_types',
    attribute: 'room_type',
    sortBy: ['name:asc'],
    cssClasses: {
      item: ['col-sm-3'],
    },
  }),

  rangeSlider({
    container: '#price',
    attribute: 'price',
    pips: false,
    tooltips: {
      format(rawValue) {
        return `$${parseInt(rawValue, 10)}`;
      },
    },
  }),

  geoSearch({
    container: '#map',
    googleReference: window.google,
    enableRefineControl: false,
    builtInMarker: {
      createOption(hit) {
        return {
          title: hit.description,
        };
      },
    },
  }),
]);

search.start();
