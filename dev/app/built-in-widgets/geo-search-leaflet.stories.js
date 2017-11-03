/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearchPlacesWidget from 'places.js/instantsearchWidget';
import instantsearch from '../../../index.js';
import wrapWithHits from '../wrap-with-hits.js';
import './geo-search-leaflet.css';

const wrapWithHitsAndConfiguration = story =>
  wrapWithHits(story, {
    indexName: 'airbnb',
    searchParameters: {
      hitsPerPage: 50,
    },
  });

export default () => {
  const Stories = storiesOf('GeoSearch (Leaflet)');
  const radius = 5000;
  const precision = 2500;
  const position = {
    lat: 37.7749,
    lng: -122.4194,
  };

  // With IP
  Stories.add(
    'with IP',
    wrapWithHitsAndConfiguration(container => {
      window.search.addWidget(
        instantsearch.widgets.geoSearchWithLeaflet({
          container,
        })
      );
    })
  )
    .add(
      'with IP & radius',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            radius,
          })
        );
      })
    )
    .add(
      'with IP & radius & precision',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            radius,
            precision,
          })
        );
      })
    );

  // With position
  Stories.add(
    'with position',
    wrapWithHitsAndConfiguration(container => {
      window.search.addWidget(
        instantsearch.widgets.geoSearchWithLeaflet({
          container,
          position,
        })
      );
    })
  )
    .add(
      'with position & radius',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            radius,
            position,
          })
        );
      })
    )
    .add(
      'with position & radius & precision',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            radius,
            precision,
            position,
          })
        );
      })
    );

  // With Places
  Stories.add(
    'with position from Places',
    wrapWithHitsAndConfiguration(container => {
      const placesElemeent = document.createElement('input');
      const mapElement = document.createElement('div');

      container.appendChild(placesElemeent);
      container.appendChild(mapElement);

      window.search.addWidget(
        instantsearchPlacesWidget({
          container: placesElemeent,
          defaultPosition: [37.7749, -122.4194],
        })
      );

      window.search.addWidget(
        instantsearch.widgets.geoSearchWithLeaflet({
          container: mapElement,
          radius: 20000,
          enableGeolocationWithIP: false,
        })
      );
    })
  );

  // Only UI
  Stories.add(
    'with control & refine on map move',
    wrapWithHitsAndConfiguration(container => {
      window.search.addWidget(
        instantsearch.widgets.geoSearchWithLeaflet({
          container,
          enableControlRefineWithMap: true,
          enableRefineOnMapMove: true,
        })
      );
    })
  )
    .add(
      'with control & disable refine on map move',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            enableControlRefineWithMap: true,
            enableRefineOnMapMove: false,
          })
        );
      })
    )
    .add(
      'without control & refine on map move',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            enableControlRefineWithMap: false,
            enableRefineOnMapMove: true,
          })
        );
      })
    )
    .add(
      'without control & disable refine on map move',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithLeaflet({
            container,
            enableControlRefineWithMap: false,
            enableRefineOnMapMove: false,
          })
        );
      })
    );
};
