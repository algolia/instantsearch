import { checkRendering } from '../../lib/utils';

const usage = `Usage:
var customGeoSearch = connectGeoSearch(function render(params, isFirstRendering) {
  // Fill corresponding values
});

search.addWidget(
  customGeoSearch({
    // Fill corresponding values
  })
);

Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectGeoSearch.html
`;

export default function connectGeoSearch(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => {
    const {
      enableRefineOnMapMove = true,
      enableGeolocationWithIP = true,
      position,
      radius,
      precision,
    } = widgetParams;

    const state = {
      isRefineOnMapMove: enableRefineOnMapMove,
      hasMapMoveSinceLastRefine: false,
      isRefinedWithMap: false,
    };

    const refine = helper => ({ northEast: ne, southWest: sw }) => {
      const boundingBox = [[ne.lat, ne.lng, sw.lat, sw.lng]];

      helper.setQueryParameter('insideBoundingBox', boundingBox).search();

      state.hasMapMoveSinceLastRefine = false;
      state.isRefinedWithMap = true;
    };

    const clearMapRefinement = () => {};

    const toggleRefineOnMapMove = () => {};

    const isRefineOnMapMove = () => state.isRefineOnMapMove;

    const setMapMoveSinceLastRefine = () => {};

    const hasMapMoveSinceLastRefine = () => state.hasMapMoveSinceLastRefine;

    const isRefinedWithMap = () => state.isRefinedWithMap;

    return {
      getConfiguration(previous) {
        const configuration = {};

        if (
          enableGeolocationWithIP &&
          !position &&
          !previous.hasOwnProperty('aroundLatLngViaIP') &&
          !previous.aroundLatLng
        ) {
          configuration.aroundLatLngViaIP = true;
        }

        if (position && !previous.aroundLatLng && !previous.aroundLatLngViaIP) {
          configuration.aroundLatLng = `${position.lat}, ${position.lng}`;
        }

        if (radius && !previous.hasOwnProperty('aroundRadius')) {
          configuration.aroundRadius = radius;
        }

        if (precision && !previous.hasOwnProperty('aroundPrecision')) {
          configuration.aroundPrecision = precision;
        }

        return configuration;
      },

      init({ helper }) {
        const isFirstRendering = true;

        renderFn(
          {
            items: [],
            refine: refine(helper),
            clearMapRefinement,
            toggleRefineOnMapMove,
            isRefineOnMapMove,
            setMapMoveSinceLastRefine,
            hasMapMoveSinceLastRefine,
            isRefinedWithMap,
            widgetParams,
          },
          isFirstRendering
        );
      },

      render({ results, helper }) {
        const isFirstRendering = false;

        renderFn(
          {
            items: results.hits,
            refine: refine(helper),
            clearMapRefinement,
            toggleRefineOnMapMove,
            isRefineOnMapMove,
            setMapMoveSinceLastRefine,
            hasMapMoveSinceLastRefine,
            isRefinedWithMap,
            widgetParams,
          },
          isFirstRendering
        );
      },

      dispose() {
        unmountFn();

        return {};
      },
    };
  };
}
