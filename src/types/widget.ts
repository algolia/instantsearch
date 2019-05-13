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
  query?: string;
  menu?: {
    [attribute: string]: string;
  };
  /**
   * The list of hierarchical menus.
   * Nested levels must contain the record separator.
   *
   * @example ['Audio', 'Audio > Headphones']
   */
  hierarchicalMenu?: {
    [attribute: string]: string[];
  };
  refinementList?: {
    [attribute: string]: string[];
  };
  numericRefinementList?: {
    [attribute: string]: number;
  };
  numericSelector?: {
    [attribute: string]: number;
  };
  /**
   * The range as a tuple.
   *
   * @example '100:500'
   */
  range?: {
    [attribute: string]: string;
  };
  starRating?: {
    [attribute: string]: number;
  };
  toggle?: {
    [attribute: string]: boolean;
  };
  sortBy?: string;
  page?: number;
  hitsPerPage?: number;
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
