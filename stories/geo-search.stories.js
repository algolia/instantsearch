// import { storiesOf } from '@storybook/html';
// import { withHits } from '../.storybook/decorators';
// import instantsearchPlacesWidget from 'places.js/instantsearchWidget';
// import injectScript from 'scriptjs';
// import { wrapWithHits } from '../../utils/wrap-with-hits';
// import createInfoBox from '../../utils/create-info-box';

// const API_KEY = 'AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ';

// const wrapWithHitsAndConfiguration = (story, searchParameters) =>
//   wrapWithHits(story, {
//     indexName: 'airbnb',
//     searchParameters: {
//       hitsPerPage: 20,
//       ...searchParameters,
//     },
//   });

// const injectGoogleMaps = fn => {
//   injectScript(
//     `https://maps.googleapis.com/maps/api/js?v=weekly&key=${API_KEY}`,
//     fn
//   );
// };

// export default () => {
//   const Stories = storiesOf('GeoSearch');
//   const initialZoom = 12;

//   const initialPosition = {
//     lat: 40.71,
//     lng: -74.01,
//   };

//   Stories.add(
//     'default',
//     wrapWithHitsAndConfiguration((container, start) =>
//       injectGoogleMaps(() => {
//         search.addWidget(
//           instantsearch.widgets.configure({
//             aroundLatLngViaIP: true,
//           })
//         );

//         search.addWidget(
//           instantsearch.widgets.geoSearch({
//             googleReference: window.google,
//             container,
//           })
//         );

//         start();
//       })
//     )
//   );

//   // With IP
//   Stories.add(
//     'with IP',
//     wrapWithHitsAndConfiguration((container, start) =>
//       injectGoogleMaps(() => {
//         search.addWidget(
//           instantsearch.widgets.configure({
//             aroundLatLngViaIP: true,
//           })
//         );

//         search.addWidget(
//           instantsearch.widgets.geoSearch({
//             googleReference: window.google,
//             container,
//             initialPosition,
//             initialZoom,
//           })
//         );

//         start();
//       })
//     )
//   ).add(
//     'with position',
//     wrapWithHitsAndConfiguration((container, start) =>
//       injectGoogleMaps(() => {
//         search.addWidget(
//           instantsearch.widgets.configure({
//             aroundLatLng: '37.7793, -122.419',
//           })
//         );

//         search.addWidget(
//           instantsearch.widgets.geoSearch({
//             googleReference: window.google,
//             container,
//             initialZoom,
//           })
//         );

//         start();
//       })
//     )
//   );

//   // With Places
//   Stories.add(
//     'with position from Places',
//     wrapWithHitsAndConfiguration((container, start) =>
//       injectGoogleMaps(() => {
//         const placesElement = document.createElement('input');
//         const mapElement = document.createElement('div');
//         mapElement.style.marginTop = '20px';

//         container.appendChild(placesElement);
//         container.appendChild(mapElement);

//         search.addWidget(
//           instantsearch.widgets.configure({
//             aroundRadius: 20000,
//           })
//         );

//         search.addWidget(
//           instantsearchPlacesWidget({
//             container: placesElement,
//             defaultPosition: ['37.7793', '-122.419'],
//           })
//         );

//         search.addWidget(
//           instantsearch.widgets.geoSearch({
//             googleReference: window.google,
//             container: mapElement,
//             enableClearMapRefinement: false,
//             initialZoom,
//           })
//         );

//         start();
//       })
//     )
//   );

//   // Only UI
//   Stories.add(
//     'with refine disabled',
//     wrapWithHitsAndConfiguration((container, start) =>
//       injectGoogleMaps(() => {
//         search.addWidget(
//           instantsearch.widgets.configure({
//             aroundLatLngViaIP: true,
//           })
//         );

//         search.addWidget(
//           instantsearch.widgets.geoSearch({
//             googleReference: window.google,
//             container,
//             initialPosition,
//             initialZoom,
//             enableRefine: false,
//           })
//         );

//         start();
//       })
//     )
//   )
//     .add(
//       'with control & refine on map move',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               container,
//               initialPosition,
//               initialZoom,
//               enableRefineControl: true,
//               enableRefineOnMapMove: true,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with control & disable refine on map move',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               enableRefineControl: true,
//               enableRefineOnMapMove: false,
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'without control & refine on map move',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               enableRefineControl: false,
//               enableRefineOnMapMove: true,
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'without control & disable refine on map move',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               enableRefineControl: false,
//               enableRefineOnMapMove: false,
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with custom templates for controls',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               templates: {
//                 reset: '<span>re-center</span>',
//                 toggle: '<span>Redo search when map moved</span>',
//                 redo: '<span>Search this area</span>',
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with custom map options',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               mapOptions: {
//                 streetViewControl: true,
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with built-in marker options',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const logger = action('[GeoSearch] click: builtInMarker');

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               builtInMarker: {
//                 createOptions: item => ({
//                   title: item.name,
//                   label: item.price_formatted,
//                 }),
//                 events: {
//                   click: ({ event, item, marker, map }) => {
//                     logger(event, item, marker, map);
//                   },
//                 },
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with built-in marker & InfoWindow',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const InfoWindow = new window.google.maps.InfoWindow();

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               builtInMarker: {
//                 events: {
//                   click: ({ item, marker, map }) => {
//                     if (InfoWindow.getMap()) {
//                       InfoWindow.close();
//                     }

//                     InfoWindow.setContent(item.name);

//                     InfoWindow.open(map, marker);
//                   },
//                 },
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with built-in marker & InfoBox',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const InfoBox = createInfoBox(window.google);
//           const InfoBoxInstance = new InfoBox();

//           InfoBoxInstance.addListener('domready', () => {
//             const bbBox = InfoBoxInstance.div_.getBoundingClientRect();

//             InfoBoxInstance.setOptions({
//               pixelOffset: new window.google.maps.Size(
//                 -bbBox.width / 2,
//                 -bbBox.height - 35 // Adjust with the marker size
//               ),
//             });
//           });

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               builtInMarker: {
//                 events: {
//                   click: ({ item, marker, map }) => {
//                     if (InfoBoxInstance.getMap()) {
//                       InfoBoxInstance.close();
//                     }

//                     InfoBoxInstance.setContent(`
//                       <div class="my-custom-info-box">
//                         <p class="my-custom-info-box__text">${item.name}</p>
//                       </div>
//                     `);

//                     InfoBoxInstance.open(map, marker);
//                   },
//                 },
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with HTML marker options',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const logger = action('[GeoSearch] click: HTMLMarker');

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               customHTMLMarker: {
//                 createOptions: () => ({
//                   anchor: {
//                     x: 0,
//                     y: 5,
//                   },
//                 }),
//                 events: {
//                   click: ({ event, item, marker, map }) => {
//                     logger(event, item, marker, map);
//                   },
//                 },
//               },
//               templates: {
//                 HTMLMarker: `
//                   <div class="my-custom-marker">
//                     {{price_formatted}}
//                   </div>
//                 `,
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with HTML marker & InfoWindow',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const InfoWindow = new window.google.maps.InfoWindow({
//             pixelOffset: new window.google.maps.Size(0, -30),
//           });

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               customHTMLMarker: {
//                 createOptions: () => ({
//                   anchor: {
//                     x: 0,
//                     y: 5,
//                   },
//                 }),
//                 events: {
//                   click: ({ item, marker, map }) => {
//                     if (InfoWindow.getMap()) {
//                       InfoWindow.close();
//                     }

//                     InfoWindow.setContent(item.name);

//                     InfoWindow.open(map, marker);
//                   },
//                 },
//               },
//               templates: {
//                 HTMLMarker: `
//                   <div class="my-custom-marker">
//                     {{price_formatted}}
//                   </div>
//                 `,
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with HTML marker & InfoBox',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const InfoBox = createInfoBox(window.google);
//           const InfoBoxInstance = new InfoBox();

//           InfoBoxInstance.addListener('domready', () => {
//             const bbBox = InfoBoxInstance.div_.getBoundingClientRect();

//             InfoBoxInstance.setOptions({
//               pixelOffset: new window.google.maps.Size(
//                 -bbBox.width / 2,
//                 -bbBox.height - 5 // Adjust with the marker offset
//               ),
//             });
//           });

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               customHTMLMarker: {
//                 createOptions: () => ({
//                   anchor: {
//                     x: 0,
//                     y: 5,
//                   },
//                 }),
//                 events: {
//                   click: ({ item, marker, map }) => {
//                     if (InfoBoxInstance.getMap()) {
//                       InfoBoxInstance.close();
//                     }

//                     InfoBoxInstance.setContent(`
//                       <div class="my-custom-info-box">
//                         <p class="my-custom-info-box__text">${item.name}</p>
//                       </div>
//                     `);

//                     InfoBoxInstance.open(map, marker);
//                   },
//                 },
//               },
//               templates: {
//                 HTMLMarker: `
//                   <div class="my-custom-marker">
//                     {{price_formatted}}
//                   </div>
//                 `,
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with Hits communication (custom)',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           const containerElement = document.querySelector(
//             '#results-hits-container'
//           );

//           const removeActiveHitClassNames = () => {
//             document.querySelectorAll('.hit').forEach(el => {
//               el.classList.remove('hit--active');
//             });
//           };

//           const removeActiveMarkerClassNames = () => {
//             document.querySelectorAll('.my-custom-marker').forEach(el => {
//               el.classList.remove('my-custom-marker--active');
//             });
//           };

//           containerElement.addEventListener('mouseover', event => {
//             const hitElement = event.target.closest('.hit');

//             if (hitElement) {
//               removeActiveMarkerClassNames();

//               const objectID = parseInt(hitElement.id.substr(4), 10);
//               const selector = `.my-custom-marker[data-id="${objectID}"]`;
//               const marker = document.querySelector(selector);

//               if (marker) {
//                 marker.classList.add('my-custom-marker--active');
//               }
//             }
//           });

//           containerElement.addEventListener('mouseleave', () => {
//             removeActiveMarkerClassNames();
//           });

//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               customHTMLMarker: {
//                 createOptions: () => ({
//                   anchor: {
//                     x: 0,
//                     y: 5,
//                   },
//                 }),
//                 events: {
//                   mouseover: ({ item }) => {
//                     removeActiveHitClassNames();

//                     const hit = document.getElementById(`hit-${item.objectID}`);

//                     if (hit) {
//                       hit.classList.add('hit--active');
//                     }
//                   },
//                   mouseleave: () => {
//                     removeActiveHitClassNames();
//                   },
//                 },
//               },
//               templates: {
//                 HTMLMarker: `
//                   <div class="my-custom-marker" data-id="{{objectID}}">
//                     {{price_formatted}}
//                   </div>
//                 `,
//               },
//               container,
//               initialPosition,
//               initialZoom,
//             })
//           );

//           start();
//         })
//       )
//     )
//     .add(
//       'with routing (simulate)',
//       wrapWithHitsAndConfiguration(
//         (container, start) =>
//           injectGoogleMaps(() => {
//             search.addWidget(
//               instantsearch.widgets.configure({
//                 aroundLatLngViaIP: true,
//               })
//             );

//             search.addWidget(
//               instantsearch.widgets.geoSearch({
//                 googleReference: window.google,
//                 container,
//                 initialPosition,
//                 initialZoom,
//               })
//             );

//             start();
//           }),
//         {
//           insideBoundingBox: [
//             [
//               48.84174222399724,
//               2.367719162523599,
//               48.81614630305218,
//               2.284205902635904,
//             ],
//           ],
//         }
//       )
//     )
//     .add(
//       'with transformed items',
//       wrapWithHitsAndConfiguration((container, start) =>
//         injectGoogleMaps(() => {
//           search.addWidget(
//             instantsearch.widgets.configure({
//               aroundLatLngViaIP: true,
//             })
//           );

//           search.addWidget(
//             instantsearch.widgets.geoSearch({
//               googleReference: window.google,
//               container,
//               builtInMarker: {
//                 createOptions: item => ({
//                   title: item.name,
//                 }),
//               },
//               transformItems: items =>
//                 items.map(item => ({
//                   ...item,
//                   name: item.name.toUpperCase(),
//                 })),
//             })
//           );

//           start();
//         })
//       )
//     );
// };
