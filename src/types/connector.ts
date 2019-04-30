import { Hits, InstantSearch, SearchResults } from './instantsearch';
import { InsightsClient } from './insights';

export type RenderOptions<TWidgetParams = unknown> = {
  widgetParams: TWidgetParams;
  instantSearchInstance: InstantSearch;
  results?: SearchResults;
  hits?: Hits;
  insights?: InsightsClient;
};

export type Renderer<TRenderOptions extends RenderOptions = any> = (
  renderOptions: TRenderOptions,
  isFirstRender: boolean
) => void;

export type Unmounter = () => void;
