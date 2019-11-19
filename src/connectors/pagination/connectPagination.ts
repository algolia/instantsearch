import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Renderer, WidgetFactory, RendererOptions } from '../../types';
import Paginator from './Paginator';
import { SearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'pagination',
  connector: true,
});

export type PaginationConnectorParams = {
  /**
   * The total number of pages to browse.
   */
  totalPages?: number;
  /**
   * The padding of pages to show around the current page.
   * default: 3
   */
  padding?: number;
};

export interface PaginationRendererOptions<TPaginationWidgetParams>
  extends RendererOptions<TPaginationWidgetParams> {
  /**
   * The number of the page currently displayed
   */
  currentRefinement: number;
  /**
   * The number of hits computed for the last query (can be approximated)
   */
  nbHits: number;
  /**
   * The number of pages for the result set
   */
  nbPages: number;
  /**
   * The actual pages relevant to the current situation and padding
   */
  pages: number[];
  /**
   *true if the current page is also the first page
   */
  isFirstPage: boolean;
  /**
   * true if the current page is also the last page
   */
  isLastPage: boolean;
  /**
   * Sets the current page and trigger a search.
   */
  refine: (page: number) => void;
  /**
   * Creates URLs for the next state, the number is the page to generate the URL for.
   */
  createURL: (page: number) => string;
}

export type PaginationRenderer<TPaginationWidgetParams> = Renderer<
  PaginationRendererOptions<PaginationConnectorParams & TPaginationWidgetParams>
>;

export type PaginationWidgetFactory<TPaginationWidgetParams> = WidgetFactory<
  PaginationConnectorParams & TPaginationWidgetParams
>;

export type PaginationConnector = <TPaginationWidgetParams>(
  render: PaginationRenderer<TPaginationWidgetParams>,
  unmount?: () => void
) => PaginationWidgetFactory<TPaginationWidgetParams>;

/**
 * **Pagination** connector provides the logic to build a widget that will let the user
 * choose the current page of the results.
 *
 * When using the pagination with Algolia, you should be aware that the engine won't provide you pages
 * beyond the 1000th hits by default. You can find more information on the [Algolia documentation](https://www.algolia.com/doc/guides/searching/pagination/#pagination-limitations).
 */
const connectPagination: PaginationConnector = (renderFn, unmountFn = noop) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { totalPages, padding = 3 } =
      widgetParams || ({} as PaginationConnectorParams);

    const pager = new Paginator({
      currentPage: 0,
      total: 0,
      padding,
    });

    type ConnectorState = {
      refine?: (page: number) => void;
      createURL?: (state: SearchParameters) => (page: number) => string;
    };

    const connectorState: ConnectorState = {};

    const getMaxPage = ({ nbPages }) =>
      totalPages !== undefined ? Math.min(totalPages, nbPages) : nbPages;

    return {
      $$type: 'ais.pagination',

      init({ helper, createURL, instantSearchInstance }) {
        connectorState.refine = page => {
          helper.setPage(page);
          helper.search();
        };

        connectorState.createURL = state => page =>
          createURL(state.setPage(page));

        renderFn(
          {
            createURL: connectorState.createURL!(helper.state),
            currentRefinement: helper.state.page || 0,
            nbHits: 0,
            nbPages: 0,
            pages: [],
            isFirstPage: true,
            isLastPage: true,
            refine: connectorState.refine!,
            widgetParams,
            instantSearchInstance,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        const page = state.page || 0;
        const nbPages = getMaxPage(results);
        pager.currentPage = page;
        pager.total = nbPages;

        renderFn(
          {
            createURL: connectorState.createURL!(state),
            currentRefinement: page,
            refine: connectorState.refine!,
            nbHits: results.nbHits,
            nbPages,
            pages: pager.pages(),
            isFirstPage: pager.isFirstPage(),
            isLastPage: pager.isLastPage(),
            widgetParams,
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('page', undefined);
      },

      getWidgetState(uiState, { searchParameters }) {
        const page = searchParameters.page || 0;

        if (!page) {
          return uiState;
        }

        return {
          ...uiState,
          page: page + 1,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        const page = uiState.page ? uiState.page - 1 : 0;

        return searchParameters.setQueryParameter('page', page);
      },

      // for tests, remove when refactored
      refine: page => connectorState.refine!(page),
      createURL: helper => connectorState.createURL!(helper),
      getMaxPage,
    };
  };
};

export default connectPagination;
