import { noop } from '../../lib/utils';

// type Hit = any;
//
// type LatLng = {
//   lat: number,
//   lng: number,
// };
//
// type Bounds = {
//   northEast: LatLng,
//   southWest: LatLng,
// };
//
// type WidgetOptions = {
//   enableGeolocationWithIP?: boolean,
//   enableRefineOnMapMove?: boolean,
//   position?: LatLng,
//   radius?: number,
//   precision?: number,
//   // ...rest of options from the Widget
// };
//
// type RenderingOptions = {
//   items: Array<Hit & { _geoloc: LatLng }>,
//   refine: (bounds: Bounds) => void,
//   clearMapRefinement: () => void,
//   toggleRefineOnMapMove: () => void,
//   isRefineOnMapMove: () => boolean,
//   setMapMoveSinceLastRefine: () => void,
//   hasMapMoveSinceLastRefine: () => boolean,
//   isRefinedWithMap: () => boolean,
//   widgetParams: WidgetOptions,
// };

export default function connectGeoSearch(fn) {
  return (widgetParams = {}) => {
    const {
      position,
      radius,
      precision,
      initialPosition,
      enableGeolocationWithIP = true,
      enableRefineOnMapMove = true,
    } = widgetParams;

    // UI State
    const uiState = {
      lastRefinePosition: '',
      hasMapMoveSinceLastRefine: false,
      isRefinedWithMap: false,
      isRefineOnMapMove: enableRefineOnMapMove,
    };

    // Very hacky solution to be able to bind only once the value.... We
    // should avoid to do this, or create an API for handle this kind of
    // situation a lot better.
    const fnState = {
      internalSetMapMoveSinceLastRefine: noop,
      internalToggleRefineOnMapMove: noop,
    };

    // - refine
    const refine = helper => ({ ne, sw }) => {
      const boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng];

      helper.setQueryParameter('insideBoundingBox', [boundingBox]).search();

      uiState.isRefinedWithMap = true;
      uiState.hasMapMoveSinceLastRefine = false;
    };

    // - isRefinedWithMap
    const isRefinedWithMap = () => uiState.isRefinedWithMap;

    // - clearMapRefinement
    const clearMapRefinement = helper => () => {
      helper.setQueryParameter('insideBoundingBox').search();

      uiState.isRefinedWithMap = false;
      uiState.hasMapMoveSinceLastRefine = false;
    };

    // - isRefineOnMapMove
    const isRefineOnMapMove = () => uiState.isRefineOnMapMove;

    const toggleRefineOnMapMove = () => fnState.internalToggleRefineOnMapMove();

    const createInternalToggleRefineOnMapMove = (
      renderFn,
      renderArgs
    ) => () => {
      const isInternalRender = true;

      uiState.isRefineOnMapMove = !uiState.isRefineOnMapMove;

      renderFn(renderArgs, isInternalRender);
    };

    // - hasMapMoveSinceLastRefine
    const hasMapMoveSinceLastRefine = () => uiState.hasMapMoveSinceLastRefine;

    const setMapMoveSinceLastRefine = () =>
      fnState.internalSetMapMoveSinceLastRefine();

    const createInternalSetMapMoveSinceLastRefine = (
      renderFn,
      renderArgs
    ) => () => {
      const isRenderRequired = !uiState.hasMapMoveSinceLastRefine;
      const isInternalRender = true;

      uiState.hasMapMoveSinceLastRefine = true;

      if (isRenderRequired) {
        renderFn(renderArgs, isInternalRender);
      }
    };

    const latLngFromString = x => {
      const [lat, lng] = x.split(',');

      return {
        lat: parseFloat(lat),
        lng: parseFloat(lng),
      };
    };

    // Public API
    const getConfiguration = configuration => {
      const partial = {};

      // We should check that the previous configuration
      // don't already use the following property

      if (position) {
        partial.aroundLatLng = `${position.lat},${position.lng}`;
      }

      if (!position && enableGeolocationWithIP) {
        partial.aroundLatLngViaIP = true;
      }

      if (radius) {
        partial.aroundRadius = radius;
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
      const currentRefinePosition = helper.getQueryParameter('aroundLatLng');

      uiState.lastRefinePosition = currentRefinePosition;

      fn(
        {
          items: [],
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          isRefinedWithMap,
          instantSearchInstance,
          widgetParams: {
            ...widgetParams,
            initialPosition: currentRefinePosition
              ? latLngFromString(currentRefinePosition)
              : initialPosition,
          },
        },
        isFirstRendering
      );
    };

    const render = (renderOptions, isInternalRender = false) => {
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

      if (!isInternalRender && !uiState.isRefinedWithMap) {
        // Reset the value when result change from outside of the widget
        // -> from query, refinement, ...
        uiState.hasMapMoveSinceLastRefine = false;
      }

      uiState.lastRefinePosition = helper.getQueryParameter('aroundLatLng');

      // Create the correct render callback with the appropriate scope
      fnState.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
        render,
        renderOptions
      );

      fnState.internalToggleRefineOnMapMove = createInternalToggleRefineOnMapMove(
        render,
        renderOptions
      );

      fn(
        {
          items: results.hits.filter(_ => _._geoloc),
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          isRefinedWithMap,
          instantSearchInstance,
          widgetParams: {
            ...widgetParams,
            initialPosition: currentRefinePosition
              ? latLngFromString(currentRefinePosition)
              : initialPosition,
          },
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
