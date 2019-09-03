import { SearchResults } from 'algoliasearch-helper';
import { Hits, InstantSearch } from './instantsearch';
import { InsightsClient } from './insights';

export type RendererOptions<TWidgetParams = unknown> = {
  /**
   * Original parameters for this widget, in case rendering depends on them.
   */
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
