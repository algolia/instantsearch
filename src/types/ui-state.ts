import { PlainSearchParameters } from 'algoliasearch-helper';

export type IndexUiState = Partial<{
  query: string;
  refinementList: {
    [attribute: string]: string[];
  };
  menu: {
    [attribute: string]: string;
  };
  /**
   * The list of hierarchical menus.
   * Nested levels must contain the record separator.
   *
   * @example ['Audio', 'Audio > Headphones']
   */
  hierarchicalMenu: {
    [attribute: string]: string[];
  };
  /**
   * The numeric menu as a tuple.
   *
   * @example ':5'
   * @example '5:10'
   * @example '10:'
   */
  numericMenu: {
    [attribute: string]: string;
  };
  ratingMenu: {
    [attribute: string]: number;
  };
  /**
   * The range as a tuple.
   *
   * @example '100:500'
   */
  range: {
    [attribute: string]: string;
  };
  toggle: {
    [attribute: string]: boolean;
  };
  geoSearch: {
    /**
     * The rectangular area in geo coordinates.
     * The rectangle is defined by two diagonally opposite points, hence by 4 floats separated by commas.
     *
     * @example '47.3165,4.9665,47.3424,5.0201'
     */
    boundingBox: string;
  };
  relevantSort: {
    relevancyStrictness: number;
  };
  sortBy: string;
  page: number;
  hitsPerPage: number;
  configure: PlainSearchParameters;
  places: {
    query: string;
    /**
     * The central geolocation.
     *
     * @example '48.8546,2.3477'
     */
    position: string;
  };
}>;

export type UiState = {
  [indexId: string]: IndexUiState;
};
