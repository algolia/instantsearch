import noop from 'lodash/noop';
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
      internalToggleRefineOnMapMove: noop,
      internalSetMapMoveSinceLastRefine: noop,
    };

    const refine = helper => ({ northEast: ne, southWest: sw }) => {
      const boundingBox = [[ne.lat, ne.lng, sw.lat, sw.lng]];

      helper.setQueryParameter('insideBoundingBox', boundingBox).search();

      state.hasMapMoveSinceLastRefine = false;
      state.isRefinedWithMap = true;
    };

    const clearMapRefinement = helper => () => {
      helper.setQueryParameter('insideBoundingBox').search();

      state.hasMapMoveSinceLastRefine = false;
      state.isRefinedWithMap = false;
    };

    const isRefinedWithMap = () => state.isRefinedWithMap;

    const toggleRefineOnMapMove = () => state.internalToggleRefineOnMapMove();
    const createInternalToggleRefinementonMapMove = (render, args) => () => {
      state.isRefineOnMapMove = !state.isRefineOnMapMove;

      render(args);
    };

    const isRefineOnMapMove = () => state.isRefineOnMapMove;

    const setMapMoveSinceLastRefine = () =>
      state.internalSetMapMoveSinceLastRefine();
    const createInternalSetMapMoveSinceLastRefine = (render, args) => () => {
      const shouldTriggerRender = state.hasMapMoveSinceLastRefine !== true;

      state.hasMapMoveSinceLastRefine = true;

      if (shouldTriggerRender) {
        render(args);
      }
    };

    const hasMapMoveSinceLastRefine = () => state.hasMapMoveSinceLastRefine;

    const init = initArgs => {
      const { helper } = initArgs;
      const isFirstRendering = true;

      state.internalToggleRefineOnMapMove = createInternalToggleRefinementonMapMove(
        noop,
        initArgs
      );

      state.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
        noop,
        initArgs
      );

      renderFn(
        {
          items: [],
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          isRefinedWithMap,
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          widgetParams,
        },
        isFirstRendering
      );
    };

    const render = renderArgs => {
      const { results, helper } = renderArgs;
      const isFirstRendering = false;

      state.internalToggleRefineOnMapMove = createInternalToggleRefinementonMapMove(
        render,
        renderArgs
      );

      state.internalSetMapMoveSinceLastRefine = createInternalSetMapMoveSinceLastRefine(
        render,
        renderArgs
      );

      renderFn(
        {
          items: results.hits,
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          isRefinedWithMap,
          widgetParams,
        },
        isFirstRendering
      );
    };

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

      init,
      render,

      dispose() {
        unmountFn();

        return {};
      },
    };
  };
}
