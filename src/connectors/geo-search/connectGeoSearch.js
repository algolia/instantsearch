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

    const state = {
      isRefinedWithMap: false,
      lastRefinePosition: '',
    };

    const refine = helper => ({ ne, sw }) => {
      const boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng];

      helper.setQueryParameter('insideBoundingBox', [boundingBox]).search();

      state.isRefinedWithMap = true;
    };

    const clearRefinementWithMap = helper => () => {
      helper.setQueryParameter('insideBoundingBox').search();

      state.isRefinedWithMap = false;
    };

    return {
      getConfiguration(configuration) {
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
      },

      init({ helper, instantSearchInstance }) {
        const isFirstRendering = true;

        state.lastRefinePosition = helper.getQueryParameter('aroundLatLng');

        fn(
          {
            ...state,
            hits: [],
            refine: refine(helper),
            clearRefinementWithMap: clearRefinementWithMap(helper),
            enableRefineOnMapMove,
            instantSearchInstance,
            widgetParams,
          },
          isFirstRendering
        );
      },

      render({ results, helper, instantSearchInstance }) {
        const isFirstRendering = false;
        const currentPosition = helper.getQueryParameter('aroundLatLng');
        const currentPositionIP = helper.getQueryParameter('aroundLatLngViaIP');
        const currentBox = helper.getQueryParameter('insideBoundingBox');

        // Hacky condition for enable to override the current search
        // when we currently refine with the map. It avoid the rendering
        // and trigger a search without the boundingBox. We defenitly
        // need to find an other solutions...
        if (currentBox && state.lastRefinePosition !== currentPosition) {
          clearRefinementWithMap(helper)();

          return;
        }

        // Pretty mulch the same with IP
        if (currentPositionIP && state.lastRefinePosition !== currentPosition) {
          helper.setQueryParameter('aroundLatLngViaIP', false).search();

          return;
        }

        state.lastRefinePosition = helper.getQueryParameter('aroundLatLng');

        fn(
          {
            ...state,
            hits: results.hits.filter(h => h._geoloc),
            refine: refine(helper),
            clearRefinementWithMap: clearRefinementWithMap(helper),
            enableRefineOnMapMove,
            instantSearchInstance,
            widgetParams,
          },
          isFirstRendering
        );
      },
    };
  };
}
