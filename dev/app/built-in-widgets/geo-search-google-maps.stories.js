/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearchPlacesWidget from 'places.js/instantsearchWidget';
import instantsearch from '../../../index.js';
import wrapWithHits from '../wrap-with-hits.js';

const wrapWithHitsAndConfiguration = story =>
  wrapWithHits(story, {
    indexName: 'airbnb',
    searchParameters: {
      hitsPerPage: 50,
    },
  });

export default () => {
  const Stories = storiesOf('GeoSearch (Google Maps)');
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
        instantsearch.widgets.geoSearchWithGoogleMaps({
          container,
        })
      );
    })
  )
    .add(
      'with IP & radius',
      wrapWithHitsAndConfiguration(container => {
        window.search.addWidget(
          instantsearch.widgets.geoSearchWithGoogleMaps({
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
          instantsearch.widgets.geoSearchWithGoogleMaps({
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
        instantsearch.widgets.geoSearchWithGoogleMaps({
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
          instantsearch.widgets.geoSearchWithGoogleMaps({
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
          instantsearch.widgets.geoSearchWithGoogleMaps({
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
        instantsearch.widgets.geoSearchWithGoogleMaps({
          container: mapElement,
          radius: 20000,
          enableGeolocationWithIP: false,
        })
      );
    })
  ).add(
    'with position from Places with refine disable on move',
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
        instantsearch.widgets.geoSearchWithGoogleMaps({
          container: mapElement,
          radius: 20000,
          enableGeolocationWithIP: false,
          enableRefineOnMapMove: false,
        })
      );
    })
  );

  // Only UI
  Stories.add(
    'disable refine on move',
    wrapWithHitsAndConfiguration(container => {
      window.search.addWidget(
        instantsearch.widgets.geoSearchWithGoogleMaps({
          container,
          enableRefineOnMapMove: false,
        })
      );
    })
  );
};
