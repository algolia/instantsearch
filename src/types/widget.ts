import {
  Helper,
  HelperState,
  SearchResults,
  InstantSearch,
  SearchParameters,
} from './instantsearch';

interface InitOptions {
  instantSearchInstance: InstantSearch;
  state?: HelperState;
  helper?: Helper;
  templatesConfig?: object;
  createURL?(state: HelperState): string;
}

interface RenderOptions {
  instantSearchInstance: InstantSearch;
  templatesConfig?: object;
  results?: SearchResults;
  state?: HelperState;
  helper?: Helper;
  searchMetadata?: {
    isSearchStalled: boolean;
  };
  createURL?(state: HelperState): string;
}

interface DisposeOptions {
  helper?: Helper;
  state: HelperState;
}

type UiState = {
  [stateKey: string]: any;
};

export interface Widget {
  init?(options: InitOptions): void;
  render?(options: RenderOptions): void;
  dispose?(options: DisposeOptions): HelperState;
  getConfiguration?(
    previousConfiguration?: SearchParameters
  ): Partial<SearchParameters>;
  getWidgetState?(
    uiState: UiState,
    widgetStateOptions: {
      state: HelperState;
      helper: Helper;
    }
  ): UiState;
  getWidgetSearchParameters?(
    state: HelperState,
    widgetSearchParametersOptions: {
      uiState: UiState;
    }
  ): SearchParameters;
}

export type WidgetFactory<T> = (widgetParams: T) => Widget;
