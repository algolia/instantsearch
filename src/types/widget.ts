import {
  Helper,
  SearchResults,
  InstantSearch,
  SearchParameters,
} from './instantsearch';

interface InitOptions {
  instantSearchInstance: InstantSearch;
  state: SearchParameters;
  helper: Helper;
  templatesConfig: object;
  createURL(state: SearchParameters): string;
}

interface RenderOptions {
  instantSearchInstance: InstantSearch;
  templatesConfig: object;
  results: SearchResults;
  state: SearchParameters;
  helper: Helper;
  searchMetadata: {
    isSearchStalled: boolean;
  };
  createURL(state: SearchParameters): string;
}

interface DisposeOptions {
  helper: Helper;
  state: SearchParameters;
}

export type UiState = {
  [stateKey: string]: any;
};

export interface Widget {
  init?(options: InitOptions): void;
  render?(options: RenderOptions): void;
  dispose?(options: DisposeOptions): SearchParameters | void;
  getConfiguration?(
    previousConfiguration?: Partial<SearchParameters>
  ): Partial<SearchParameters>;
  getWidgetState?(
    uiState: UiState,
    widgetStateOptions: {
      searchParameters: SearchParameters;
      helper: Helper;
    }
  ): UiState;
  getWidgetSearchParameters?(
    state: SearchParameters,
    widgetSearchParametersOptions: {
      uiState: UiState;
    }
  ): SearchParameters;
}

export type WidgetFactory<TWidgetParams> = (
  widgetParams: TWidgetParams
) => Widget;

export type Template<TTemplateItem> =
  | string
  | ((item: TTemplateItem) => string);
