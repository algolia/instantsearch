import { SendEventForHits } from '../../lib/utils';
import {
  Connector,
  GeoLoc,
  Hit,
  TransformItems,
  WidgetRenderState,
} from '../../types';

export type GeoHit = Hit & Required<Pick<Hit, '_geoLoc'>>;

type Bounds = {
  northEast: GeoLoc;
  southWest: GeoLoc;
};

export type GeoSearchRenderState = {
  currentRefinement?: Bounds;
  position?: GeoLoc;
  items: GeoHit[];
  refine(bounds: Bounds): void;
  clearMapRefinement(): void;
  hasMapMoveSinceLastRefine(): boolean;
  isRefineOnMapMove(): boolean;
  isRefinedWithMap(): boolean;
  setMapMoveSinceLastRefine(): void;
  toggleRefineOnMapMove(): void;
  sendEvent: SendEventForHits;
};

export type GeoSearchConnectorParams = {
  enableRefineOnMapMove: boolean;
  transformItems: TransformItems<GeoHit>;
};

export type GeoSearchWidgetDescription = {
  $$type: 'ais.geoSearch';
  renderState: GeoSearchRenderState;
  indexRenderState: {
    geoSearch: WidgetRenderState<
      GeoSearchRenderState,
      GeoSearchConnectorParams
    >;
  };
  indexUiState: {
    geoSearch: {
      /**
       * The rectangular area in geo coordinates.
       * The rectangle is defined by two diagonally opposite points, hence by 4 floats separated by commas.
       *
       * @example '47.3165,4.9665,47.3424,5.0201'
       */
      boundingBox: string;
    };
  };
};

export type GeoSearchConnector = Connector<
  GeoSearchWidgetDescription,
  GeoSearchConnectorParams
>;
