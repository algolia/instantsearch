import { Hits, InstantSearch, SearchResults } from './instantsearch';
import { InsightsClient } from './insights';

export type RendererOptions<TWidgetParams = unknown> = {
  widgetParams: TWidgetParams;
  instantSearchInstance: InstantSearch;
  results?: SearchResults;
  hits?: Hits;
  insights?: InsightsClient;
};

export type Renderer<TRenderOptions extends RendererOptions = any> = (
  renderOptions: TRenderOptions,
  isFirstRender: boolean
) => void;

export type Unmounter = () => void;
