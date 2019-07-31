import { Index } from '../widgets/index/index';
import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
  SearchResults,
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

export interface ScopedResult {
  indexId: string;
  results: SearchResults;
}

export interface RenderOptions {
  instantSearchInstance: InstantSearch;
  templatesConfig: object;
  results: SearchResults;
  scopedResults: ScopedResult[];
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

export interface WidgetStateOptions {
  searchParameters: SearchParameters;
  helper: Helper;
}

export interface WidgetSearchParametersOptions {
  uiState: UiState;
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

/**
 * Widgets are the building blocks of InstantSearch.js. Any valid widget must
 * have at least a `render` or a `init` function.
 */
export interface Widget {
  $$type?: string;
  /**
   * Called once before the first search
   */
  init?(options: InitOptions): void;
  /**
   * Called after each search response has been received
   */
  render?(options: RenderOptions): void;
  /**
   * Called when this widget is unmounted. Used to remove refinements set by
   * during this widget's initialization and life time.
   */
  dispose?(options: DisposeOptions): SearchParameters | void;
  getConfiguration?(previousConfiguration: SearchParameters): SearchParameters;
  getWidgetState?(
    uiState: UiState,
    widgetStateOptions: WidgetStateOptions
  ): UiState;
  getWidgetSearchParameters?(
    state: SearchParameters,
    widgetSearchParametersOptions: WidgetSearchParametersOptions
  ): SearchParameters;
}

export type WidgetFactory<TWidgetParams> = (
  widgetParams: TWidgetParams
) => Widget;

export type Template<TTemplateItem> =
  | string
  | ((item: TTemplateItem) => string);
