import noop from 'lodash/noop';
import {
  checkRendering,
  warn,
  aroundLatLngToPosition,
  insideBoundingBoxToBoundingBox,
} from '../../lib/utils';

const usage = `Usage:

var customGeoSearch = connectGeoSearch(function render(params, isFirstRendering) {
  // params = {
  //   items,
  //   position,
  //   currentRefinement,
  //   refine,
  //   clearMapRefinement,
  //   isRefinedWithMap,
  //   toggleRefineOnMapMove,
  //   isRefineOnMapMove,
  //   setMapMoveSinceLastRefine,
  //   hasMapMoveSinceLastRefine,
  //   hasMapMoveSinceLastRefine,
  //   widgetParams,
  //   instantSearchInstance,
  // }
});

search.addWidget(
  customGeoSearch({
    [ enableRefineOnMapMove = true ],
    [ transformItems ],
  })
);

Full documentation available at https://community.algolia.com/instantsearch.js/v2/connectors/connectGeoSearch.html
`;

/**
 * @typedef {Object} LatLng
 * @property {number} lat The latitude in degrees.
 * @property {number} lng The longitude in degrees.
 */

/**
 * @typedef {Object} Bounds
 * @property {LatLng} northEast The top right corner of the map view.
 * @property {LatLng} southWest The bottom left corner of the map view.
 */

/**
 * @typedef {Object} CustomGeoSearchWidgetOptions
 * @property {boolean} [enableRefineOnMapMove=true] If true, refine will be triggered as you move the map.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} GeoSearchRenderingOptions
 * @property {Object[]} items The matched hits from Algolia API.
 * @property {Bounds} currentRefinement The current bounding box of the search.
 * @property {function(Bounds)} refine Sets a bounding box to filter the results from the given map bounds.
 * @property {function()} clearMapRefinement Reset the current bounding box refinement.
 * @property {function(): boolean} isRefinedWithMap Return true if the current refinement is set with the map bounds.
 * @property {function()} toggleRefineOnMapMove Toggle the fact that the user is able to refine on map move.
 * @property {function(): boolean} isRefineOnMapMove Return true if the user is able to refine on map move.
 * @property {function()} setMapMoveSinceLastRefine Set the fact that the map has moved since the last refinement, should be call on each map move. The call to the function triggers a new rendering only when the value change.
 * @property {function(): boolean} hasMapMoveSinceLastRefine Return true if the map has move since the last refinement.
 * @property {Object} widgetParams All original `CustomGeoSearchWidgetOptions` forwarded to the `renderFn`.
 * @property {LatLng} [position] The current position of the search.
 */

/**
 * The **GeoSearch** connector provides the logic to build a widget that will display the results on a map. It also provides a way to search for results based on their position. The connector provides functions to manage the search experience (search on map interaction or control the interaction for example).
 *
 * @requirements
 *
 * Note that the GeoSearch connector uses the [geosearch](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be passed to the rendering function.
 *
 * Currently, the feature is not compatible with multiple values in the _geoloc attribute.
 *
 * @type {Connector}
 * @param {function(GeoSearchRenderingOptions, boolean)} renderFn Rendering function for the custom **GeoSearch** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomGeoSearchWidgetOptions)} Re-usable widget factory for a custom **GeoSearch** widget.
 * @staticExample
 * // This example use Leaflet for the rendering, be sure to have the library correctly setup
 * // before trying the demo. You can find more details in their documentation (link below).
 * // We choose Leaflet for the example but you can use any libraries that you want.
 * // See: http://leafletjs.com/examples/quick-start
 *
 * let map = null;
 * let markers = [];
 *
 * // custom `renderFn` to render the custom GeoSearch widget
 * function renderFn(GeoSearchRenderingOptions, isFirstRendering) {
 *   const { items, widgetParams } = GeoSearchRenderingOptions;
 *
 *   if (isFirstRendering) {
 *     map = L.map(widgetParams.container);
 *
 *     L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
 *       attribution:
 *         '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
 *     }).addTo(map);
 *   }
 *
 *   markers.forEach(marker => marker.remove());
 *
 *   markers = items.map(({ _geoloc }) =>
 *     L.marker([_geoloc.lat, _geoloc.lng]).addTo(map)
 *   );
 *
 *   if (markers.length) {
 *     map.fitBounds(L.featureGroup(markers).getBounds());
 *   }
 * }
 *
 * // connect `renderFn` to GeoSearch logic
 * const customGeoSearch = instantsearch.connectors.connectGeoSearch(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customGeoSearch({
 *     container: document.getElementById('custom-geo-search'),
 *   })
 * );
 */
const connectGeoSearch = (renderFn, unmountFn) => {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      enableRefineOnMapMove = true,
      transformItems = items => items,
    } = widgetParams;

    // Always trigger this message because the default value was `true`. We can't
    // display the message only when the parameter is defined otherwise a user that was
    // relying on the default value won't have any information about the changes.
    warn(`
The option \`enableGeolocationWithIP\` has been removed from the GeoSearch widget.
Please consider using the \`Configure\` widget instead:

search.addWidget(
  configure({
    aroundLatLngViaIP: ${widgetParams.enableGeolocationWithIP || 'true'},
  })
);

You can find more information inside the migration guide:
http://community.algolia.com/instantsearch.js/migration-guide
        `);

    if (typeof widgetParams.position !== 'undefined') {
      warn(`
The option \`position\` has been removed from the GeoSearch widget.
Please consider using the \`Configure\` widget instead:

search.addWidget(
  configure({
    aroundLatLng: '${widgetParams.position.lat}, ${widgetParams.position.lng}',
  })
);

You can find more information inside the migration guide:
http://community.algolia.com/instantsearch.js/migration-guide
      `);
    }

    if (typeof widgetParams.radius !== 'undefined') {
      warn(`
The option \`radius\` has been removed from the GeoSearch widget.
Please consider using the \`Configure\` widget instead:

search.addWidget(
  configure({
    aroundRadius: ${widgetParams.radius},
  })
);

You can find more information inside the migration guide:

http://community.algolia.com/instantsearch.js/migration-guide
      `);
    }

    if (typeof widgetParams.precision !== 'undefined') {
      warn(`
The option \`precision\` has been removed from the GeoSearch widget.
Please consider using the \`Configure\` widget instead:

search.addWidget(
  configure({
    aroundPrecision: ${widgetParams.precision},
  })
);

You can find more information inside the migration guide:

http://community.algolia.com/instantsearch.js/migration-guide
      `);
    }

    const widgetState = {
      isRefineOnMapMove: enableRefineOnMapMove,
      hasMapMoveSinceLastRefine: false,
      lastRefinePosition: '',
      lastRefineBoundingBox: '',
      internalToggleRefineOnMapMove: noop,
      internalSetMapMoveSinceLastRefine: noop,
    };

    const getPositionFromState = state =>
      state.aroundLatLng && aroundLatLngToPosition(state.aroundLatLng);

    const getCurrentRefinementFromState = state =>
      state.insideBoundingBox &&
      insideBoundingBoxToBoundingBox(state.insideBoundingBox);

    const refine = helper => ({ northEast: ne, southWest: sw }) => {
      const boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng].join();

      helper.setQueryParameter('insideBoundingBox', boundingBox).search();

      widgetState.hasMapMoveSinceLastRefine = false;
      widgetState.lastRefineBoundingBox = boundingBox;
    };

    const clearMapRefinement = helper => () => {
      helper.setQueryParameter('insideBoundingBox').search();
    };

    const isRefinedWithMap = state => () => Boolean(state.insideBoundingBox);

    const toggleRefineOnMapMove = () =>
      widgetState.internalToggleRefineOnMapMove();
    const createInternalToggleRefinementonMapMove = (render, args) => () => {
      widgetState.isRefineOnMapMove = !widgetState.isRefineOnMapMove;

      render(args);
    };

    const isRefineOnMapMove = () => widgetState.isRefineOnMapMove;

    const setMapMoveSinceLastRefine = () =>
      widgetState.internalSetMapMoveSinceLastRefine();
    const createInternalSetMapMoveSinceLastRefine = (render, args) => () => {
      const shouldTriggerRender =
        widgetState.hasMapMoveSinceLastRefine !== true;

      widgetState.hasMapMoveSinceLastRefine = true;

      if (shouldTriggerRender) {
        render(args);
      }
    };

    const hasMapMoveSinceLastRefine = () =>
      widgetState.hasMapMoveSinceLastRefine;

    const init = initArgs => {
      const { state, helper, instantSearchInstance } = initArgs;
      const isFirstRendering = true;

      widgetState.internalToggleRefineOnMapMove = createInternalToggleRefinementonMapMove(
        noop,
        initArgs
      );

      widgetState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
        noop,
        initArgs
      );

      renderFn(
        {
          items: [],
          position: getPositionFromState(state),
          currentRefinement: getCurrentRefinementFromState(state),
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          isRefinedWithMap: isRefinedWithMap(state),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          widgetParams,
          instantSearchInstance,
        },
        isFirstRendering
      );
    };

    const render = renderArgs => {
      const { results, helper, instantSearchInstance } = renderArgs;
      const isFirstRendering = false;
      // We don't use the state provided by the render function because we need
      // to be sure that the state is the latest one for the following condition
      const state = helper.getState();

      const positionChangedSinceLastRefine =
        Boolean(state.aroundLatLng) &&
        Boolean(widgetState.lastRefinePosition) &&
        state.aroundLatLng !== widgetState.lastRefinePosition;

      const boundingBoxChangedSinceLastRefine =
        !state.insideBoundingBox &&
        Boolean(widgetState.lastRefineBoundingBox) &&
        state.insideBoundingBox !== widgetState.lastRefineBoundingBox;

      if (positionChangedSinceLastRefine || boundingBoxChangedSinceLastRefine) {
        widgetState.hasMapMoveSinceLastRefine = false;
      }

      widgetState.lastRefinePosition = state.aroundLatLng || '';
      widgetState.lastRefineBoundingBox = state.insideBoundingBox || '';

      widgetState.internalToggleRefineOnMapMove = createInternalToggleRefinementonMapMove(
        render,
        renderArgs
      );

      widgetState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
        render,
        renderArgs
      );

      const items = transformItems(results.hits.filter(hit => hit._geoloc));

      renderFn(
        {
          items,
          position: getPositionFromState(state),
          currentRefinement: getCurrentRefinementFromState(state),
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          isRefinedWithMap: isRefinedWithMap(state),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          widgetParams,
          instantSearchInstance,
        },
        isFirstRendering
      );
    };

    return {
      init,
      render,

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('insideBoundingBox');
      },
    };
  };
};

export default connectGeoSearch;
