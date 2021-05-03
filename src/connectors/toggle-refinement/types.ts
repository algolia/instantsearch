import { SendEventForFacet } from '../../lib/utils';
import { Connector, CreateURL, WidgetRenderState } from '../../types';

type ToggleRefinementConnectorParams = {
  attribute: string;
  on: string | string[];
  off: string | string[];
};

type FacetValue = {
  isRefined: boolean;
  count: number;
};

type ToggleRefinementRenderState = {
  value: {
    name: string;
    isRefined: boolean;
    count: number | null;
    onFacetValue: FacetValue;
    offFacetValue: FacetValue;
  };
  createURL: CreateURL<string>;
  sendEvent: SendEventForFacet;
  canRefine: boolean;
  refine: (value: string) => void;
};

export type ToggleRefinementWidgetDescription = {
  $$type: 'ais.toggleRefinement';
  renderState: ToggleRefinementRenderState;
  indexRenderState: {
    toggleRefinement: {
      [attribute: string]: WidgetRenderState<
        ToggleRefinementRenderState,
        ToggleRefinementConnectorParams
      >;
    };
  };
  indexUiState: {
    toggle: {
      [attribute: string]: boolean;
    };
  };
};

export type ToggleRefinementConnector = Connector<
  ToggleRefinementWidgetDescription,
  ToggleRefinementConnectorParams
>;
