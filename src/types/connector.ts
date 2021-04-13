import { SearchResults } from 'algoliasearch-helper';
import { InstantSearch } from './instantsearch';
import { InsightsClient } from './insights';
import { WidgetFactory } from './widget-factory';
import { Hits } from './results';

/**
 * The base renderer options. All render functions receive
 * the options below plus the specific options per connector.
 */
export type RendererOptions<TWidgetParams> = {
  /**
   * The original widget params. Useful as you may
   * need them while using the render function.
   */
  widgetParams: TWidgetParams;

  /**
   * The current instant search instance.
   */
  instantSearchInstance: InstantSearch;

  /**
   * The original search results.
   */
  results?: SearchResults;

  /**
   * The mutable list of hits. The may change depending
   * of the given transform items function.
   */
  hits?: Hits;

  /**
   * The current insights client, if any.
   */
  insights?: InsightsClient;
};

/**
 * The render function.
 */
export type Renderer<TRenderOptions, TWidgetParams> = (
  /**
   * The base render options plus the specific options of the widget.
   */
  renderOptions: TRenderOptions & RendererOptions<TWidgetParams>,

  /**
   * If is the first run.
   */
  isFirstRender: boolean
) => void;

/**
 * The called function when unmounting a widget.
 */
export type Unmounter = () => void;

/**
 * The connector handles the business logic and exposes
 * a simplified API to the rendering function.
 */
export type Connector<TRendererOptions, TConnectorParams> = <TWidgetParams>(
  /**
   * The render function.
   */
  renderFn: Renderer<TRendererOptions, TConnectorParams & TWidgetParams>,

  /**
   * The called function when unmounting a widget.
   */
  unmountFn?: Unmounter
) => WidgetFactory<
  TRendererOptions,
  // a connector doesn't know the difference between TWidgetParams and the
  // TConnectorParams for the context of rendering.
  TConnectorParams & TWidgetParams,
  TConnectorParams & TWidgetParams
>;

/**
 * Transforms the given items.
 */
export type TransformItems<TItem> = (items: TItem[]) => TItem[];

/**
 * Transforms the given items.
 */
export type SortBy<TItem> =
  | ((a: TItem, b: TItem) => number)
  | Array<'count' | 'isRefined' | 'name:asc' | 'name:desc'>;

/**
 * Creates the URL for the given value.
 */
export type CreateURL<TValue> = (value: TValue) => string;
