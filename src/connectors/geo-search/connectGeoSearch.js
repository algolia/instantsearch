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

    const widgetState = {
      isRefineOnMapMove: enableRefineOnMapMove,
      hasMapMoveSinceLastRefine: false,
      isRefinedWithMap: false,
      lastRefinePosition: '',
      lastRefineBoundingBox: '',
      internalToggleRefineOnMapMove: noop,
      internalSetMapMoveSinceLastRefine: noop,
    };

    const refine = helper => ({ northEast: ne, southWest: sw }) => {
      const boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng].join();

      helper.setQueryParameter('insideBoundingBox', boundingBox).search();

      widgetState.hasMapMoveSinceLastRefine = false;
      widgetState.isRefinedWithMap = true;
      widgetState.lastRefineBoundingBox = boundingBox;
    };

    const clearMapRefinement = helper => () => {
      helper.setQueryParameter('insideBoundingBox').search();
    };

    const isRefinedWithMap = () => widgetState.isRefinedWithMap;

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
      const { helper, instantSearchInstance } = initArgs;
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
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          isRefinedWithMap,
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
        state.aroundLatLng &&
        widgetState.lastRefinePosition &&
        state.aroundLatLng !== widgetState.lastRefinePosition;

      const boundingBoxChangedSinceLastRefine =
        !state.insideBoundingBox &&
        widgetState.lastRefineBoundingBox &&
        state.insideBoundingBox !== widgetState.lastRefineBoundingBox;

      if (positionChangedSinceLastRefine || boundingBoxChangedSinceLastRefine) {
        widgetState.hasMapMoveSinceLastRefine = false;
        widgetState.isRefinedWithMap = false;
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

      renderFn(
        {
          items: results.hits.filter(hit => hit._geoloc),
          refine: refine(helper),
          clearMapRefinement: clearMapRefinement(helper),
          toggleRefineOnMapMove,
          isRefineOnMapMove,
          setMapMoveSinceLastRefine,
          hasMapMoveSinceLastRefine,
          isRefinedWithMap,
          widgetParams,
          instantSearchInstance,
        },
        isFirstRendering
      );
    };

    return {
      init,
      render,

      getConfiguration(previous) {
        const configuration = {};

        if (
          enableGeolocationWithIP &&
          !position &&
          !previous.aroundLatLng &&
          previous.aroundLatLngViaIP === undefined
        ) {
          configuration.aroundLatLngViaIP = true;
        }

        if (position && !previous.aroundLatLng && !previous.aroundLatLngViaIP) {
          configuration.aroundLatLng = `${position.lat}, ${position.lng}`;
        }

        if (radius && !previous.aroundRadius) {
          configuration.aroundRadius = radius;
        }

        if (precision && !previous.aroundPrecision) {
          configuration.aroundPrecision = precision;
        }

        return configuration;
      },

      dispose({ state }) {
        unmountFn();

        let nextState = state;

        if (enableGeolocationWithIP && !position) {
          nextState = state.setQueryParameter('aroundLatLngViaIP');
        }

        if (position) {
          nextState = state.setQueryParameter('aroundLatLng');
        }

        if (radius) {
          nextState = state.setQueryParameter('aroundRadius');
        }

        if (precision) {
          nextState = state.setQueryParameter('aroundPrecision');
        }

        return nextState;
      },
    };
  };
}
