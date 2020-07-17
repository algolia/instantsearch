import { storiesOf } from '@storybook/html';
import { action } from '@storybook/addon-actions';
import { withHits, withLifecycle } from '../.storybook/decorators';
import createInfoBox from '../.storybook/utils/create-info-box';
import algoliaPlaces from 'places.js';
import places from '../src/widgets/places/places';
import { configure } from '../src/widgets';
import injectScript from 'scriptjs';

const API_KEY = 'AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ';

const withHitsAndConfigure = (fn, options) =>
  withHits(
    args => {
      const { search } = args;

      search.addWidgets([
        configure({
          aroundLatLngViaIP: true,
          hitsPerPage: 20,
        }),
      ]);

      fn(args);
    },
    {
      ...options,
      indexName: 'airbnb',
    }
  );

const injectGoogleMaps = fn => {
  injectScript(
    `https://maps.googleapis.com/maps/api/js?v=weekly&key=${API_KEY}`,
    fn
  );
};

const stories = storiesOf('Results/GeoSearch', module);
const initialZoom = 12;
const initialPosition = {
  lat: 40.71,
  lng: -74.01,
};

stories.add(
  'default',
  withHitsAndConfigure(({ search, container, instantsearch }) =>
    injectGoogleMaps(() => {
      search.addWidgets([
        instantsearch.widgets.geoSearch({
          googleReference: window.google,
          container,
        }),
      ]);
    })
  )
);

// With IP
stories
  .add(
    'with IP',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with position',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          configure({
            aroundLatLngViaIP: false,
            aroundLatLng: '37.7793, -122.419',
          }),

          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialZoom,
          }),
        ]);
      })
    )
  );

// With Places
stories.add(
  'with position from Places',
  withHitsAndConfigure(({ search, container, instantsearch }) =>
    injectGoogleMaps(() => {
      const placesElement = document.createElement('input');
      const mapElement = document.createElement('div');
      mapElement.style.marginTop = '20px';

      container.appendChild(placesElement);
      container.appendChild(mapElement);

      search.addWidgets([
        configure({
          aroundRadius: 20000,
        }),

        places({
          placesReference: algoliaPlaces,
          container: placesElement,
          defaultPosition: ['37.7793', '-122.419'],
        }),

        instantsearch.widgets.geoSearch({
          googleReference: window.google,
          container: mapElement,
          enableClearMapRefinement: false,
          initialZoom,
        }),
      ]);
    })
  )
);

// Only UI
stories
  .add(
    'with refine disabled',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialPosition,
            initialZoom,
            enableRefine: false,
          }),
        ]);
      })
    )
  )
  .add(
    'with control & refine on map move',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            initialPosition,
            initialZoom,
            enableRefineControl: true,
            enableRefineOnMapMove: true,
          }),
        ]);
      })
    )
  )
  .add(
    'with control & disable refine on map move',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            enableRefineControl: true,
            enableRefineOnMapMove: false,
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'without control & refine on map move',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            enableRefineControl: false,
            enableRefineOnMapMove: true,
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'without control & disable refine on map move',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            enableRefineControl: false,
            enableRefineOnMapMove: false,
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with custom templates for controls',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            templates: {
              reset: '<span>re-center</span>',
              toggle: '<span>Redo search when map moved</span>',
              redo: '<span>Search this area</span>',
            },
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with custom map options',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            mapOptions: {
              streetViewControl: true,
            },
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with built-in marker options',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        const logger = action('[GeoSearch] click: builtInMarker');

        search.addWidgets([
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
          }),
        ]);
      })
    )
  )
  .add(
    'with built-in marker & InfoWindow',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        const InfoWindow = new window.google.maps.InfoWindow();

        search.addWidgets([
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
          }),
        ]);
      })
    )
  )
  .add(
    'with built-in marker & InfoBox',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
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

        search.addWidgets([
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
          }),
        ]);
      })
    )
  )
  .add(
    'with HTML marker options',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        const logger = action('[GeoSearch] click: HTMLMarker');

        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            customHTMLMarker: {
              createOptions: () => ({
                anchor: {
                  x: 0,
                  y: 5,
                },
              }),
              events: {
                click: ({ event, item, marker, map }) => {
                  logger(event, item, marker, map);
                },
              },
            },
            templates: {
              HTMLMarker: `
                <div class="my-custom-marker">
                  {{price_formatted}}
                </div>
              `,
            },
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with HTML marker & InfoWindow',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        const InfoWindow = new window.google.maps.InfoWindow({
          pixelOffset: new window.google.maps.Size(0, -30),
        });

        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            customHTMLMarker: {
              createOptions: () => ({
                anchor: {
                  x: 0,
                  y: 5,
                },
              }),
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
            templates: {
              HTMLMarker: `
                <div class="my-custom-marker">
                  {{price_formatted}}
                </div>
              `,
            },
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with HTML marker & InfoBox',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
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

        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            customHTMLMarker: {
              createOptions: () => ({
                anchor: {
                  x: 0,
                  y: 5,
                },
              }),
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
            templates: {
              HTMLMarker: `
                <div class="my-custom-marker">
                  {{price_formatted}}
                </div>
              `,
            },
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with Hits communication (custom)',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
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

        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            customHTMLMarker: {
              createOptions: () => ({
                anchor: {
                  x: 0,
                  y: 5,
                },
              }),
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
            templates: {
              HTMLMarker: `
                <div class="my-custom-marker" data-id="{{objectID}}">
                  {{price_formatted}}
                </div>
              `,
            },
            container,
            initialPosition,
            initialZoom,
          }),
        ]);
      })
    )
  )
  .add(
    'with routing (simulate)',
    withHitsAndConfigure(
      ({ search, container, instantsearch }) =>
        injectGoogleMaps(() => {
          search.addWidgets([
            instantsearch.widgets.geoSearch({
              googleReference: window.google,
              container,
              initialPosition,
              initialZoom,
            }),
          ]);
        }),
      {
        initialUiState: {
          airbnb: {
            geoSearch: {
              boundingBox:
                '48.84174222399724, 2.367719162523599, 48.81614630305218, 2.284205902635904',
            },
          },
        },
      }
    )
  )
  .add(
    'with transformed items',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        search.addWidgets([
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container,
            builtInMarker: {
              createOptions: item => ({
                title: item.name,
              }),
            },
            transformItems: items =>
              items.map(item => ({
                ...item,
                name: item.name.toUpperCase(),
              })),
          }),
        ]);
      })
    )
  )
  .add(
    'with add/remove',
    withHitsAndConfigure(({ search, container, instantsearch }) =>
      injectGoogleMaps(() => {
        withLifecycle(search, container, node =>
          instantsearch.widgets.geoSearch({
            googleReference: window.google,
            container: node,
          })
        );
      })
    )
  );
