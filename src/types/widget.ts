import {
  Helper,
  HelperState,
  SearchResults,
  InstantSearch,
  SearchParameters,
} from './instantsearch';

interface WidgetArgs {
  helper: Helper;
  state?: HelperState;
  results?: SearchResults;
  instantSearchInstance: InstantSearch;
}

export interface Widget {
  init(options: WidgetArgs): void;
  render(options: WidgetArgs): void;
  dispose(options: any): SearchParameters;
  getConfiguration?(previousConfiguration: SearchParameters): SearchParameters;
}

export type WidgetFactory<T> = (widgetParams: T) => Widget;
