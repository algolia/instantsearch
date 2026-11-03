import type { WidgetRenderState } from '../../types';

export type PlacesWidgetParams = any;

export type PlacesWidgetDescription = {
  $$type: 'ais.places';
  $$widgetType: 'ais.places';
  renderState: Record<string, unknown>;
  indexRenderState: {
    places: WidgetRenderState<Record<string, unknown>, PlacesWidgetParams>;
  };
  indexUiState: {
    places: {
      query: string;
      position: string;
    };
  };
};
