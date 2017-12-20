/* eslint-disable import/default */

import { storiesOf } from 'dev-novel';
import instantsearchPlacesWidget from 'places.js/instantsearchWidget';
import injectScript from 'scriptjs';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const wrapWithHitsAndConfiguration = story =>
  wrapWithHits(story, {
    indexName: 'airbnb',
    searchParameters: {
      hitsPerPage: 50,
    },
  });

const injectGoogleMaps = fn => {
  injectScript('https://maps.googleapis.com/maps/api/js', fn);
};

export default () => {
  const Stories = storiesOf('GeoSearch');
  const radius = 5000;
  const precision = 2500;
  const initialZoom = 12;

  const position = {
    lat: 37.7749,
    lng: -122.4194,
  };

  const initialPosition = {
    lat: 40.71,
    lng: -74.01,
  };

  const paddingBoundingBox = {
    top: 41,
    right: 13,
    bottom: 5,
    left: 13,
  };

  // With IP
  Stories.add(
    'with IP',
    wrapWithHitsAndConfiguration(container =>
      injectGoogleMaps(() => {
        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleInstance: window.google,
            container,
            initialPosition,
            initialZoom,
            paddingBoundingBox,
          })
        );
      })
    )
  )
    .add(
      'with IP & radius',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              radius,
            })
          );
        })
      )
    )
    .add(
      'with IP & radius & precision',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              radius,
              precision,
            })
          );
        })
      )
    );

  // With position
  Stories.add(
    'with position',
    wrapWithHitsAndConfiguration(container =>
      injectGoogleMaps(() => {
        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleInstance: window.google,
            container,
            initialZoom,
            paddingBoundingBox,
            position,
          })
        );
      })
    )
  )
    .add(
      'with position & radius',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialZoom,
              paddingBoundingBox,
              radius,
              position,
            })
          );
        })
      )
    )
    .add(
      'with position & radius & precision',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialZoom,
              paddingBoundingBox,
              radius,
              precision,
              position,
            })
          );
        })
      )
    );

  // With Places
  Stories.add(
    'with position from Places',
    wrapWithHitsAndConfiguration(container =>
      injectGoogleMaps(() => {
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
          instantsearch.widgets.geoSearch({
            googleInstance: window.google,
            container: mapElement,
            radius: 20000,
            enableGeolocationWithIP: false,
            initialZoom,
            paddingBoundingBox,
          })
        );
      })
    )
  );

  // Only UI
  Stories.add(
    'with control & refine on map move',
    wrapWithHitsAndConfiguration(container =>
      injectGoogleMaps(() => {
        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleInstance: window.google,
            container,
            initialPosition,
            initialZoom,
            paddingBoundingBox,
            enableRefineControl: true,
            enableRefineOnMapMove: true,
          })
        );
      })
    )
  )
    .add(
      'with control & disable refine on map move',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              enableRefineControl: true,
              enableRefineOnMapMove: false,
            })
          );
        })
      )
    )
    .add(
      'without control & refine on map move',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              enableRefineControl: false,
              enableRefineOnMapMove: true,
            })
          );
        })
      )
    )
    .add(
      'without control & disable refine on map move',
      wrapWithHitsAndConfiguration(container =>
        injectGoogleMaps(() => {
          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleInstance: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              enableRefineControl: false,
              enableRefineOnMapMove: false,
            })
          );
        })
      )
    );
};
