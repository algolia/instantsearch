import { noop } from '../../lib/utils';

// type LatLng = Array<number, number>;
//
// type Bounds = {
//   northEast: LatLng,
//   southWest: LatLng,
// };
//
// type Position = {
//   top: number,
//   right: number,
//   bottom: number,
//   left: number,
// };
//
// type WidgetOptions = {
//   enableGeolocationWithIP: boolean,
//   enableRefineOnMapMove: boolean,
//   paddingBoundingBox: Position,
//   position?: string, // 40.71, -74.01
//   radius?: number | 'all',
//   minRadius?: number,
//   precision?: number,
//   ...rest of options from the Widget
// };
//
// type RenderingOptions = {
//   items: Array<{ _geoloc: { lat: number, lng: number } }>,
//   refine: (bounds: Bounds) => void,
//   clearMapRefinement: () => void,
//   toggleRefineOnMapMove: () => void,
//   setMapMoveSinceLastRefine: () => void,
//   isRefinedWithMap: boolean,
//   enableRefineOnMapMove: boolean,
//   hasMapMoveSinceLastRefine: boolean,
//   widgetParams: WidgetOptions,
// };

export default function connectGeoSearch(fn) {
  return (widgetParams = {}) => {
    const {
      position,
      radius,
      minRadius,
      precision,
      enableGeolocationWithIP = true,
      enableRefineOnMapMove = true,
    } = widgetParams;

    if (radius !== undefined && minRadius !== undefined) {
      throw new Error('Usage: only one of the radius should be pass');
    }

    // UI State
    const uiState = {
      lastRefinePosition: '',
      isRefinedWithMap: false,
      hasMapMoveSinceLastRefine: false,
      enableRefineOnMapMove,
    };

    // Private API
    const refine = helper => ({ ne, sw }) => {
      const boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng];

      helper.setQueryParameter('insideBoundingBox', [boundingBox]).search();

      uiState.isRefinedWithMap = true;
      uiState.hasMapMoveSinceLastRefine = false;
    };

    const clearMapRefinement = helper => () => {
      helper.setQueryParameter('insideBoundingBox').search();

      uiState.isRefinedWithMap = false;
      uiState.hasMapMoveSinceLastRefine = false;
    };

    const toggleRefineOnMapMove = (renderFn, renderArgs) => () => {
      uiState.enableRefineOnMapMove = !uiState.enableRefineOnMapMove;

      renderFn(renderArgs);
    };

    const setMapMoveSinceLastRefine = (renderFn, renderArgs) => () => {
      const isRenderRequired = !uiState.hasMapMoveSinceLastRefine;

      uiState.hasMapMoveSinceLastRefine = true;

      if (isRenderRequired) {
        renderFn(renderArgs);
      }
    };

    // Public API
    const getConfiguration = configuration => {
      const partial = {};

      // We should check that the previous configuration
      // don't already use the following property

      if (position) {
        partial.aroundLatLng = `${position.lat}, ${position.lng}`;
      }

      if (!position && enableGeolocationWithIP) {
        partial.aroundLatLngViaIP = true;
      }

      if (radius) {
        partial.aroundRadius = radius;
      }

      if (minRadius) {
        partial.minimumAroundRadius = minRadius;
      }

      if (precision) {
        partial.aroundPrecision = precision;
      }

      return {
        ...configuration,
        ...partial,
      };
    };

    const init = renderOptions => {
      const { helper, instantSearchInstance } = renderOptions;

      const isFirstRendering = true;

      uiState.lastRefinePosition = helper.getQueryParameter('aroundLatLng');

      helper.on('result', () => {
        // Reset the value when result change from outside of the widget
        // -> from query, refinement, ...
        if (uiState.enableRefineOnMapMove || !uiState.isRefinedWithMap) {
          uiState.hasMapMoveSinceLastRefine = false;
        }
      });

      fn(
        {
          ...uiState,
          items: [],
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          // Noop on the init
          toggleRefineOnMapMove: toggleRefineOnMapMove(noop, renderOptions),
          // Noop on the init
          setMapMoveSinceLastRefine: setMapMoveSinceLastRefine(
            noop,
            renderOptions
          ),
          instantSearchInstance,
          widgetParams,
        },
        isFirstRendering
      );
    };

    const render = renderOptions => {
      const { results, helper, instantSearchInstance } = renderOptions;

      const isFirstRendering = false;
      const currentRefinePosition = helper.getQueryParameter('aroundLatLng');
      const currentPositionIP = helper.getQueryParameter('aroundLatLngViaIP');
      const currentBox = helper.getQueryParameter('insideBoundingBox');
      const isRefinePositionChanged =
        uiState.lastRefinePosition !== currentRefinePosition;

      // Hacky condition for enable to override the current search
      // when we currently refine with the map. It avoid the rendering
      // and trigger a search without the boundingBox. We defenitly
      // need to find an other solutions...
      // -> this behaviour trigger the search two times, one with the
      // boundingBox & one without
      if (currentBox && isRefinePositionChanged) {
        clearMapRefinement(helper)();

        return;
      }

      // Pretty mulch the same with IP
      // -> this behaviour trigger the search two times, one with the
      // aroundLatLngViaIP & one without
      if (currentPositionIP && isRefinePositionChanged) {
        helper.setQueryParameter('aroundLatLngViaIP', false).search();

        return;
      }

      uiState.lastRefinePosition = helper.getQueryParameter('aroundLatLng');

      fn(
        {
          ...uiState,
          items: results.hits.filter(h => h._geoloc),
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          toggleRefineOnMapMove: toggleRefineOnMapMove(render, renderOptions),
          setMapMoveSinceLastRefine: setMapMoveSinceLastRefine(
            render,
            renderOptions
          ),
          instantSearchInstance,
          widgetParams,
        },
        isFirstRendering
      );
    };

    return {
      getConfiguration,
      init,
      render,
    };
  };
}
