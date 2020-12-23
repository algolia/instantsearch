import {
  checkRendering,
  aroundLatLngToPosition,
  insideBoundingBoxToBoundingBox,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'geo-search',
  connector: true,
});

const $$type = 'ais.geoSearch';

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
 * @typedef {Object} CustomGeoSearchWidgetParams
 * @property {boolean} [enableRefineOnMapMove=true] If true, refine will be triggered as you move the map.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * @typedef {Object} GeoSearchRenderingOptions
 * @property {Object[]} items The matched hits from Algolia API.
 * @property {LatLng} position The current position of the search.
 * @property {Bounds} currentRefinement The current bounding box of the search.
 * @property {function(Bounds)} refine Sets a bounding box to filter the results from the given map bounds.
 * @property {function()} clearMapRefinement Reset the current bounding box refinement.
 * @property {function(): boolean} isRefinedWithMap Return true if the current refinement is set with the map bounds.
 * @property {function()} toggleRefineOnMapMove Toggle the fact that the user is able to refine on map move.
 * @property {function(): boolean} isRefineOnMapMove Return true if the user is able to refine on map move.
 * @property {function()} setMapMoveSinceLastRefine Set the fact that the map has moved since the last refinement, should be call on each map move. The call to the function triggers a new rendering only when the value change.
 * @property {function(): boolean} hasMapMoveSinceLastRefine Return true if the map has move since the last refinement.
 * @property {Object} widgetParams All original `CustomGeoSearchWidgetParams` forwarded to the `renderFn`.
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
 * @param {function(GeoSearchRenderingOptions, boolean)} renderFn Rendering function for the custom **GeoSearch** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomGeoSearchWidgetParams)} Re-usable widget factory for a custom **GeoSearch** widget.
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
 * search.addWidgets([
 *   customGeoSearch({
 *     container: document.getElementById('custom-geo-search'),
 *   })
 * ]);
 */
const connectGeoSearch = (renderFn, unmountFn = noop) => {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const {
      enableRefineOnMapMove = true,
      transformItems = items => items,
    } = widgetParams;

    const widgetState = {
      isRefineOnMapMove: enableRefineOnMapMove,
      // @MAJOR hasMapMoveSinceLastRefine -> hasMapMovedSinceLastRefine
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
      helper.setQueryParameter('insideBoundingBox', undefined).search();
    };

    const isRefinedWithMap = state => () => Boolean(state.insideBoundingBox);

    const toggleRefineOnMapMove = () =>
      widgetState.internalToggleRefineOnMapMove();
    const createInternalToggleRefinementOnMapMove = (render, args) => () => {
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

    let sendEvent;

    return {
      $$type,

      init(initArgs) {
        const { instantSearchInstance } = initArgs;
        const isFirstRendering = true;

        widgetState.internalToggleRefineOnMapMove = createInternalToggleRefinementOnMapMove(
          noop,
          initArgs
        );

        widgetState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
          noop,
          initArgs
        );

        renderFn(
          {
            ...this.getWidgetRenderState(initArgs),
            instantSearchInstance,
          },
          isFirstRendering
        );
      },

      render(renderArgs) {
        const { helper, instantSearchInstance } = renderArgs;
        const isFirstRendering = false;
        // We don't use the state provided by the render function because we need
        // to be sure that the state is the latest one for the following condition
        const state = helper.state;

        const positionChangedSinceLastRefine =
          Boolean(state.aroundLatLng) &&
          Boolean(widgetState.lastRefinePosition) &&
          state.aroundLatLng !== widgetState.lastRefinePosition;

        const boundingBoxChangedSinceLastRefine =
          !state.insideBoundingBox &&
          Boolean(widgetState.lastRefineBoundingBox) &&
          state.insideBoundingBox !== widgetState.lastRefineBoundingBox;

        if (
          positionChangedSinceLastRefine ||
          boundingBoxChangedSinceLastRefine
        ) {
          widgetState.hasMapMoveSinceLastRefine = false;
        }

        widgetState.lastRefinePosition = state.aroundLatLng || '';
        widgetState.lastRefineBoundingBox = state.insideBoundingBox || '';

        widgetState.internalToggleRefineOnMapMove = createInternalToggleRefinementOnMapMove(
          this.render.bind(this),
          renderArgs
        );

        widgetState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
          this.render.bind(this),
          renderArgs
        );

        const widgetRenderState = this.getWidgetRenderState(renderArgs);

        sendEvent('view', widgetRenderState.items);

        renderFn(
          {
            ...widgetRenderState,
            instantSearchInstance,
          },
          isFirstRendering
        );
      },

      getWidgetRenderState(renderOptions) {
        const { helper, results, instantSearchInstance } = renderOptions;
        const state = helper.state;

        const items = results
          ? transformItems(results.hits.filter(hit => hit._geoloc))
          : [];

        if (!sendEvent) {
          sendEvent = createSendEventForHits({
            instantSearchInstance,
            index: helper.getIndex(),
            widgetType: $$type,
          });
        }

        return {
          items,
          position: getPositionFromState(state),
          currentRefinement: getCurrentRefinementFromState(state),
          refine: refine(helper),
          sendEvent,
          clearMapRefinement: clearMapRefinement(helper),
          isRefinedWithMap: isRefinedWithMap(state),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          widgetParams,
        };
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          geoSearch: this.getWidgetRenderState(renderOptions),
        };
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('insideBoundingBox', undefined);
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const boundingBox = searchParameters.insideBoundingBox;

        if (
          !boundingBox ||
          (uiState &&
            uiState.geoSearch &&
            uiState.geoSearch.boundingBox === boundingBox)
        ) {
          return uiState;
        }

        return {
          ...uiState,
          geoSearch: {
            boundingBox,
          },
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        if (!uiState || !uiState.geoSearch) {
          return searchParameters.setQueryParameter(
            'insideBoundingBox',
            undefined
          );
        }

        return searchParameters.setQueryParameter(
          'insideBoundingBox',
          uiState.geoSearch.boundingBox
        );
      },
    };
  };
};

export default connectGeoSearch;
