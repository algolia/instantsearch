import {
  checkRendering,
  aroundLatLngToPosition,
  insideBoundingBoxToBoundingBox,
  createDocumentationMessageGenerator,
  createSendEventForHits,
  noop,
} from '../../lib/utils';

import type { SendEventForHits } from '../../lib/utils';
import type {
  BaseHit,
  Connector,
  GeoLoc,
  Hit,
  InitOptions,
  RenderOptions,
  TransformItems,
  WidgetRenderState,
} from '../../types';
import type {
  AlgoliaSearchHelper,
  SearchParameters,
} from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'geo-search',
  connector: true,
});

// in this connector, we assume insideBoundingBox is only a string,
// even though in the helper it's defined as number[][] alone.
// This can be done, since the connector assumes "control" of the parameter
function getBoundingBoxAsString(state: SearchParameters) {
  return (state.insideBoundingBox as unknown as string) || '';
}
function setBoundingBoxAsString(state: SearchParameters, value: string) {
  return state.setQueryParameter(
    'insideBoundingBox',
    value as unknown as number[][]
  );
}

export type GeoHit<THit extends BaseHit = Record<string, any>> = Hit<THit> &
  Required<Pick<Hit, '_geoloc'>>;

type Bounds = {
  /**
   * The top right corner of the map view.
   */
  northEast: GeoLoc;
  /**
   * The bottom left corner of the map view.
   */
  southWest: GeoLoc;
};

export type GeoSearchRenderState<THit extends BaseHit = Record<string, any>> = {
  /**
   * Reset the current bounding box refinement.
   */
  clearMapRefinement(): void;
  /**
   * The current bounding box of the search.
   */
  currentRefinement?: Bounds;
  /**
   * Return true if the map has move since the last refinement.
   */
  hasMapMoveSinceLastRefine(): boolean;
  /**
   * Return true if the current refinement is set with the map bounds.
   */
  isRefinedWithMap(): boolean;
  /**
   * Return true if the user is able to refine on map move.
   */
  isRefineOnMapMove(): boolean;
  /**
   * The matched hits from Algolia API.
   */
  items: Array<GeoHit<THit>>;
  /**
   * The current position of the search.
   */
  position?: GeoLoc;
  /**
   * Sets a bounding box to filter the results from the given map bounds.
   */
  refine(bounds: Bounds): void;
  /**
   * Send event to insights middleware
   */
  sendEvent: SendEventForHits;
  /**
   * Set the fact that the map has moved since the last refinement, should be
   * called on each map move. The call to the function triggers a new rendering
   * only when the value change.
   */
  setMapMoveSinceLastRefine(): void;
  /**
   * Toggle the fact that the user is able to refine on map move.
   */
  toggleRefineOnMapMove(): void;
};

export type GeoSearchConnectorParams<
  THit extends BaseHit = Record<string, any>
> = {
  /**
   * If true, refine will be triggered as you move the map.
   * @default true
   */
  enableRefineOnMapMove?: boolean;
  /**
   * Function to transform the items passed to the templates.
   * @default items => items
   */
  transformItems?: TransformItems<GeoHit<THit>>;
};

const $$type = 'ais.geoSearch';

export type GeoSearchWidgetDescription<
  THit extends BaseHit = Record<string, any>
> = {
  $$type: 'ais.geoSearch';
  renderState: GeoSearchRenderState<THit>;
  indexRenderState: {
    geoSearch: WidgetRenderState<
      GeoSearchRenderState<THit>,
      GeoSearchConnectorParams<THit>
    >;
  };
  indexUiState: {
    geoSearch: {
      /**
       * The rectangular area in geo coordinates.
       * The rectangle is defined by two diagonally opposite points,
       * hence by 4 floats separated by commas.
       *
       * @example '47.3165,4.9665,47.3424,5.0201'
       */
      boundingBox: string;
    };
  };
};

export type GeoSearchConnector<THit extends BaseHit = Record<string, any>> =
  Connector<GeoSearchWidgetDescription<THit>, GeoSearchConnectorParams<THit>>;

/**
 * The **GeoSearch** connector provides the logic to build a widget that will display the results on a map. It also provides a way to search for results based on their position. The connector provides functions to manage the search experience (search on map interaction or control the interaction for example).
 *
 * @requirements
 *
 * Note that the GeoSearch connector uses the [geosearch](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be passed to the rendering function.
 *
 * Currently, the feature is not compatible with multiple values in the _geoloc attribute.
 */
const connectGeoSearch: GeoSearchConnector = (renderFn, unmountFn = noop) => {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      enableRefineOnMapMove = true,
      transformItems = ((items) => items) as NonNullable<
        GeoSearchConnectorParams['transformItems']
      >,
    } = widgetParams || {};

    const widgetState = {
      isRefineOnMapMove: enableRefineOnMapMove,
      // @MAJOR hasMapMoveSinceLastRefine -> hasMapMovedSinceLastRefine
      hasMapMoveSinceLastRefine: false,
      lastRefinePosition: '',
      lastRefineBoundingBox: '',
      internalToggleRefineOnMapMove: noop,
      internalSetMapMoveSinceLastRefine: noop,
    };

    const getPositionFromState = (state: SearchParameters) =>
      state.aroundLatLng
        ? aroundLatLngToPosition(state.aroundLatLng)
        : undefined;

    const getCurrentRefinementFromState = (state: SearchParameters) =>
      state.insideBoundingBox &&
      insideBoundingBoxToBoundingBox(state.insideBoundingBox);

    const refine =
      (helper: AlgoliaSearchHelper) =>
      ({ northEast: ne, southWest: sw }: Bounds) => {
        const boundingBox = [ne.lat, ne.lng, sw.lat, sw.lng].join();

        helper
          .setState(
            setBoundingBoxAsString(helper.state, boundingBox).resetPage()
          )
          .search();

        widgetState.hasMapMoveSinceLastRefine = false;
        widgetState.lastRefineBoundingBox = boundingBox;
      };

    const clearMapRefinement = (helper: AlgoliaSearchHelper) => () => {
      helper.setQueryParameter('insideBoundingBox', undefined).search();
    };

    const isRefinedWithMap = (state: SearchParameters) => () =>
      Boolean(state.insideBoundingBox);

    const toggleRefineOnMapMove = () =>
      widgetState.internalToggleRefineOnMapMove();
    const createInternalToggleRefinementOnMapMove =
      <TRenderOptions extends RenderOptions | InitOptions>(
        renderOptions: TRenderOptions,
        // false positive eslint because of generics
        // eslint-disable-next-line no-shadow
        render: (renderOptions: TRenderOptions) => void
      ) =>
      () => {
        widgetState.isRefineOnMapMove = !widgetState.isRefineOnMapMove;

        render(renderOptions);
      };

    const isRefineOnMapMove = () => widgetState.isRefineOnMapMove;

    const setMapMoveSinceLastRefine = () =>
      widgetState.internalSetMapMoveSinceLastRefine();
    const createInternalSetMapMoveSinceLastRefine =
      <TRenderOptions extends RenderOptions | InitOptions>(
        renderOptions: TRenderOptions,
        // false positive eslint because of generics
        // eslint-disable-next-line no-shadow
        render: (renderOptions: TRenderOptions) => void
      ) =>
      () => {
        const shouldTriggerRender =
          widgetState.hasMapMoveSinceLastRefine !== true;

        widgetState.hasMapMoveSinceLastRefine = true;

        if (shouldTriggerRender) {
          render(renderOptions);
        }
      };

    const hasMapMoveSinceLastRefine = () =>
      widgetState.hasMapMoveSinceLastRefine;

    let sendEvent: SendEventForHits;

    return {
      $$type,

      init(initArgs) {
        const { instantSearchInstance } = initArgs;
        const isFirstRendering = true;

        widgetState.internalToggleRefineOnMapMove =
          createInternalToggleRefinementOnMapMove(initArgs, noop);

        widgetState.internalSetMapMoveSinceLastRefine =
          createInternalSetMapMoveSinceLastRefine(initArgs, noop);

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

        widgetState.lastRefineBoundingBox = getBoundingBoxAsString(state);

        widgetState.internalToggleRefineOnMapMove =
          createInternalToggleRefinementOnMapMove(
            renderArgs,
            this.render!.bind(this)
          );

        widgetState.internalSetMapMoveSinceLastRefine =
          createInternalSetMapMoveSinceLastRefine(
            renderArgs,
            this.render!.bind(this)
          );

        const widgetRenderState = this.getWidgetRenderState(renderArgs);

        sendEvent('view:internal', widgetRenderState.items);

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
          ? transformItems(
              results.hits.filter((hit) => hit._geoloc),
              { results }
            )
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
        const boundingBox = getBoundingBoxAsString(searchParameters);

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
        return setBoundingBoxAsString(
          searchParameters,
          uiState.geoSearch.boundingBox
        );
      },
    };
  };
};

export default connectGeoSearch;
