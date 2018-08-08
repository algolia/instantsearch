/* eslint-disable import/default */

import { storiesOf, action } from 'dev-novel';
import instantsearchPlacesWidget from 'places.js/instantsearchWidget';
import injectScript from 'scriptjs';
import instantsearch from '../../../../index';
import { wrapWithHits } from '../../utils/wrap-with-hits';
import createInfoBox from '../../utils/create-info-box';

const API_KEY = 'AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ';

const wrapWithHitsAndConfiguration = (story, searchParameters) =>
  wrapWithHits(story, {
    indexName: 'airbnb',
    searchParameters: {
      hitsPerPage: 25,
      ...searchParameters,
    },
  });

const injectGoogleMaps = fn => {
  injectScript(
    `https://maps.googleapis.com/maps/api/js?v=3.31&key=${API_KEY}`,
    fn
  );
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

  Stories.add(
    'default',
    wrapWithHitsAndConfiguration((container, start) =>
      injectGoogleMaps(() => {
        container.style.height = '600px';

        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
          })
        );

        start();
      })
    )
  ).add(
    'with transformed items',
    wrapWithHitsAndConfiguration((container, start) =>
      injectGoogleMaps(() => {
        container.style.height = '600px';

        window.search.addWidget(
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            transformItems: items =>
              items.map(item => ({
                ...item,
                _geoloc: {
                  lat: item._geoloc.lat + 2,
                  lng: item._geoloc.lng + 2,
                },
              })),
          })
        );

        start();
      })
    )
  );

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
        const placesElement = document.createElement('input');
        const mapElement = document.createElement('div');
        mapElement.style.height = '500px';
        mapElement.style.marginTop = '20px';

        container.appendChild(placesElement);
        container.appendChild(mapElement);

        window.search.addWidget(
          instantsearchPlacesWidget({
            container: placesElement,
            defaultPosition: [position.lat, position.lng],
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
      'with custom templates for controls',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              templates: {
                clear: '<span>re-center</span>',
                toggle: '<span>Redo search when map moved</span>',
                redo: '<span>Search this area</span>',
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
                  click: ({ event, item, marker, map }) => {
                    logger(event, item, marker, map);
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
      'with built-in marker & InfoWindow',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const InfoWindow = new window.google.maps.InfoWindow();

          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              builtInMarker: {
                events: {
                  click: ({ item, marker, map }) => {
                    if (InfoWindow.getMap()) {
                      InfoWindow.close();
                    }

                    InfoWindow.setContent(item.name);

                    InfoWindow.open(map, marker);
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
      'with built-in marker & InfoBox',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const InfoBox = createInfoBox(window.google);
          const InfoBoxInstance = new InfoBox();

          InfoBoxInstance.addListener('domready', () => {
            const bbBox = InfoBoxInstance.div_.getBoundingClientRect();

            InfoBoxInstance.setOptions({
              pixelOffset: new window.google.maps.Size(
                -bbBox.width / 2,
                -bbBox.height - 35 // Adjust with the marker size
              ),
            });
          });

          container.style.height = '600px';

          window.search.addWidget(
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              builtInMarker: {
                events: {
                  click: ({ item, marker, map }) => {
                    if (InfoBoxInstance.getMap()) {
                      InfoBoxInstance.close();
                    }

                    InfoBoxInstance.setContent(`
                      <div class="my-custom-info-box">
                        <p class="my-custom-info-box__text">${item.name}</p>
                      </div>
                    `);

                    InfoBoxInstance.open(map, marker);
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
                  click: ({ event, item, marker, map }) => {
                    logger(event, item, marker, map);
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
      'with HTML marker & InfoWindow',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const InfoWindow = new window.google.maps.InfoWindow({
            pixelOffset: new window.google.maps.Size(0, -30),
          });

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
                  click: ({ item, marker, map }) => {
                    if (InfoWindow.getMap()) {
                      InfoWindow.close();
                    }

                    InfoWindow.setContent(item.name);

                    InfoWindow.open(map, marker);
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
      'with HTML marker & InfoBox',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const InfoBox = createInfoBox(window.google);
          const InfoBoxInstance = new InfoBox();

          InfoBoxInstance.addListener('domready', () => {
            const bbBox = InfoBoxInstance.div_.getBoundingClientRect();

            InfoBoxInstance.setOptions({
              pixelOffset: new window.google.maps.Size(
                -bbBox.width / 2,
                -bbBox.height - 5 // Adjust with the marker offset
              ),
            });
          });

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
                  click: ({ item, marker, map }) => {
                    if (InfoBoxInstance.getMap()) {
                      InfoBoxInstance.close();
                    }

                    InfoBoxInstance.setContent(`
                      <div class="my-custom-info-box">
                        <p class="my-custom-info-box__text">${item.name}</p>
                      </div>
                    `);

                    InfoBoxInstance.open(map, marker);
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
      'with Hits communication (custom)',
      wrapWithHitsAndConfiguration((container, start) =>
        injectGoogleMaps(() => {
          const containerElement = document.querySelector(
            '#results-hits-container'
          );

          const removeActiveHitClassNames = () => {
            document.querySelectorAll('.hit').forEach(el => {
              el.classList.remove('hit--active');
            });
          };

          const removeActiveMarkerClassNames = () => {
            document.querySelectorAll('.my-custom-marker').forEach(el => {
              el.classList.remove('my-custom-marker--active');
            });
          };

          containerElement.addEventListener('mouseover', event => {
            const hitElement = event.target.closest('.hit');

            if (hitElement) {
              removeActiveMarkerClassNames();

              const objectID = parseInt(hitElement.id.substr(4), 10);
              const selector = `.my-custom-marker[data-id="${objectID}"]`;
              const marker = document.querySelector(selector);

              if (marker) {
                marker.classList.add('my-custom-marker--active');
              }
            }
          });

          containerElement.addEventListener('mouseleave', () => {
            removeActiveMarkerClassNames();
          });

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
                  <div class="my-custom-marker" data-id="{{objectID}}">
                    {{price_formatted}}
                  </div>
                `,
                events: {
                  mouseover: ({ item }) => {
                    removeActiveHitClassNames();

                    const hit = document.getElementById(`hit-${item.objectID}`);

                    if (hit) {
                      hit.classList.add('hit--active');
                    }
                  },
                  mouseleave: () => {
                    removeActiveHitClassNames();
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
    )
    .add(
      'without results',
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
          query: 'dsdsdsds',
        }
      )
    );
};
