/* eslint-disable import/default */

import { storiesOf, action } from 'dev-novel';
import instantsearchPlacesWidget from 'places.js/instantsearchWidget';
import injectScript from 'scriptjs';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits.js';

const wrapWithHitsAndConfiguration = (story, searchParameters) =>
  wrapWithHits(story, {
    indexName: 'airbnb',
    searchParameters: {
      hitsPerPage: 25,
      ...searchParameters,
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
    lat: 37.7793,
    lng: -122.419,
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
    wrapWithHitsAndConfiguration((container, start) =>
      injectGoogleMaps(() => {
        container.style.height = '600px';

        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialPosition,
            initialZoom,
            paddingBoundingBox,
          })
        );

        start();
      })
    )
  )
    .add(
      'with IP & radius',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              radius,
            })
          );

          start();
        })
      )
    )
    .add(
      'with IP & radius & precision',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
              radius,
              precision,
            })
          );

          start();
        })
      )
    );

  // With position
  Stories.add(
    'with position',
    wrapWithHitsAndConfiguration((container, start) =>
      injectGoogleMaps(() => {
        container.style.height = '600px';

        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialZoom,
            paddingBoundingBox,
            position,
          })
        );

        start();
      })
    )
  )
    .add(
      'with position & radius',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              container,
              initialZoom,
              paddingBoundingBox,
              radius,
              position,
            })
          );

          start();
        })
      )
    )
    .add(
      'with position & radius & precision',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              container,
              initialZoom,
              paddingBoundingBox,
              radius,
              precision,
              position,
            })
          );

          start();
        })
      )
    );

  // With Places
  Stories.add(
    'with position from Places',
    wrapWithHitsAndConfiguration((container, start) =>
      injectGoogleMaps(() => {
        const placesElemeent = document.createElement('input');
        const mapElement = document.createElement('div');
        mapElement.style.height = '500px';
        mapElement.style.marginTop = '20px';

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
            googleReference: window.google,
            container: mapElement,
            radius: 20000,
            enableGeolocationWithIP: false,
            enableClearMapRefinement: false,
            initialZoom,
            paddingBoundingBox,
          })
        );

        start();
      })
    )
  );

  // Only UI
  Stories.add(
    'with control & refine on map move',
    wrapWithHitsAndConfiguration((container, start) =>
      injectGoogleMaps(() => {
        container.style.height = '600px';

        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialPosition,
            initialZoom,
            paddingBoundingBox,
            enableRefineControl: true,
            enableRefineOnMapMove: true,
          })
        );

        start();
      })
    )
  )
    .add(
      'with control & disable refine on map move',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              enableRefineControl: true,
              enableRefineOnMapMove: false,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
            })
          );

          start();
        })
      )
    )
    .add(
      'without control & refine on map move',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              enableRefineControl: false,
              enableRefineOnMapMove: true,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
            })
          );

          start();
        })
      )
    )
    .add(
      'without control & disable refine on map move',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              enableRefineControl: false,
              enableRefineOnMapMove: false,
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
            })
          );

          start();
        })
      )
    )
    .add(
      'with custom map options',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              mapOptions: {
                streetViewControl: true,
              },
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
            })
          );

          start();
        })
      )
    )
    .add(
      'with built-in marker options',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const logger = action('[GeoSearch] click: builtInMarker');

          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              builtInMarker: {
                createOptions: item => ({
                  title: item.name,
                  label: item.price_formatted,
                }),
                events: {
                  click: (event, item) => {
                    logger(event, item);
                  },
                },
              },
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
            })
          );

          start();
        })
      )
    )
    .add(
      'with HTML marker options',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const logger = action('[GeoSearch] click: HTMLMarker');

          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              customHTMLMarker: {
                createOptions: () => ({
                  anchor: {
                    x: 0,
                    y: 5,
                  },
                }),
                template: `
                  <div class="my-custom-marker">
                    {{price_formatted}}
                  </div>
                `,
                events: {
                  click: (event, item) => {
                    logger(event, item);
                  },
                },
              },
              container,
              initialPosition,
              initialZoom,
              paddingBoundingBox,
            })
          );

          start();
        })
      )
    )
    .add(
      'with URLSync (simulate)',
      wrapWithHitsAndConfiguration(
        (container, start) =>
          injectGoogleMaps(() => {
            container.style.height = '600px';

            window.search.addWidget(
              instantsearch.widgets.geoSearch({
                googleReference: window.google,
                container,
                initialPosition,
                initialZoom,
                paddingBoundingBox,
              })
            );

            start();
          }),
        {
          insideBoundingBox: [
            [
              48.84174222399724,
              2.367719162523599,
              48.81614630305218,
              2.284205902635904,
            ],
          ],
        }
      )
    );
};
