import { liteClient as algoliasearch } from 'algoliasearch/lite';
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

import 'instantsearch.css/themes/reset.css';

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
      item(hit, { html, components }) {
        return html`
          <div class="hit col-sm-3">
            <div class="pictures-wrapper">
              <img class="picture" src="${hit.picture_url}" />
              <img class="profile" src="${hit.user.user.thumbnail_url}" />
            </div>
            <div class="infos">
              <h4 class="media-heading">
                ${components.Highlight({ hit, attribute: 'name' })}
              </h4>
              <p>
                ${hit.room_type} -
                ${components.Highlight({ hit, attribute: 'city' })},
                ${components.Highlight({ hit, attribute: 'country' })}
              </p>
            </div>
          </div>
        `;
      },
      empty({ query }, { html }) {
        return html`<div class="text-center">
          No results found matching <strong>${query}</strong>.
        </div>`;
      },
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
