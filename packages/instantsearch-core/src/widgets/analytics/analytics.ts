import type { WidgetRenderState } from '../../types';
import type { SearchParameters, SearchResults } from 'algoliasearch-helper';

export type AnalyticsWidgetParamsPushFunction = (
  formattedParameters: string,
  state: SearchParameters,
  results: SearchResults
) => void;

export type AnalyticsWidgetParams = {
  pushFunction: AnalyticsWidgetParamsPushFunction;
  delay?: number;
  triggerOnUIInteraction?: boolean;
  pushInitialSearch?: boolean;
  pushPagination?: boolean;
};

export type AnalyticsWidgetDescription = {
  $$type: 'ais.analytics';
  $$widgetType: 'ais.analytics';
  renderState: Record<string, unknown>;
  indexRenderState: {
    analytics: WidgetRenderState<Record<string, unknown>, AnalyticsWidgetParams>;
  };
};
