type InstantSearch = any;
type Helper = any;
type SearchParameters = any;
type SearchMetadata = any;

interface WidgetArgs {
  helper: Helper;
  instantSearchInstance: InstantSearch;
  searchMetadata: SearchMetadata;
  onHistoryChange: (callback: (state: any) => void) => void;
}

export interface Widget {
  render(options: WidgetArgs): void;
  init?(options: WidgetArgs): void;
  getConfiguration?(previous: SearchParameters): SearchParameters;
  dispose?(options: any): SearchParameters;
  // ...
}

/**
 * Connector
 */

export interface RenderOptions<T = unknown> {
  widgetParams: T;
  instantSearchInstance: InstantSearch;
}

export type CreateWidget<T> = (widgetParams: T) => Widget;

export type Renderer<T extends RenderOptions> = (
  renderOptions: T,
  isFirstRender: boolean
) => void;

export interface Refinable<T> {
  refine(input: T): void;
}

export interface URLSyncable<T> {
  createURL(input: T): string;
}

// Useless for now -> find out how to make it generic - ConnectSearchBox
// interface Connector<U extends WidgetConnectorParams, T extends RenderOptions<U>> {
//   <V>(render: Renderer<T>, unmount: () => void): CreateWidget<U>;
// }

// interface Connector<T extends WidgetConnectorParams, U<V> extends RenderOptions<V>> {
//   <W>(render: Renderer<U<W>>, unmount: () => void): CreateWidget<T & W>;
// }
