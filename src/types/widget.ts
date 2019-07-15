import { Index } from '../widgets/index/index';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
  PlainSearchParameters,
} from 'algoliasearch-helper';
import { InstantSearch } from './instantsearch';

export interface InitOptions {
  instantSearchInstance: InstantSearch;
  parent: Index | null;
  state: SearchParameters;
  helper: Helper;
  templatesConfig: object;
  createURL(state: SearchParameters): string;
}

export interface RenderOptions {
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

export interface DisposeOptions {
  helper: Helper;
  state: SearchParameters;
}

export type UiState = {
  query?: string;
  refinementList?: {
    [attribute: string]: string[];
  };
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
  /**
   * The numeric menu as a tuple.
   *
   * @example ':5'
   * @example '5:10'
   * @example '10:'
   */
  numericMenu?: {
    [attribute: string]: string;
  };
  ratingMenu?: {
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
  toggle?: {
    [attribute: string]: boolean;
  };
  geoSearch?: {
    /**
     * The rectangular area in geo coordinates.
     * The rectangle is defined by two diagonally opposite points, hence by 4 floats separated by commas.
     *
     * @example '47.3165,4.9665,47.3424,5.0201'
     */
    boundingBox: string;
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
    previousConfiguration?: PlainSearchParameters
  ): PlainSearchParameters;
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
