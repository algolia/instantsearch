import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import Paginator from './Paginator';
import { Connector, WidgetRenderState } from '../../types';
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
   * The padding of pages to show around the current page
   * @default 3
   */
  padding?: number;
};

export type PaginationRenderState = {
  /** Creates URLs for the next state, the number is the page to generate the URL for. */
  createURL(page: number): string;

  /** Sets the current page and triggers a search. */
  refine(page: number): void;

  /** true if this search returned more than one page */
  canRefine: boolean;

  /** The number of the page currently displayed. */
  currentRefinement: number;

  /** The number of hits computed for the last query (can be approximated). */
  nbHits: number;

  /** The number of pages for the result set. */
  nbPages: number;

  /** The actual pages relevant to the current situation and padding. */
  pages: number[];

  /** true if the current page is also the first page. */
  isFirstPage: boolean;

  /** true if the current page is also the last page. */
  isLastPage: boolean;
};

export type PaginationWidgetDescription = {
  $$type: 'ais.pagination';
  renderState: PaginationRenderState;
  indexRenderState: {
    pagination: WidgetRenderState<
      PaginationRenderState,
      PaginationConnectorParams
    >;
  };
  indexUiState: {
    page: number;
  };
};

type PaginationConnector = Connector<
  PaginationWidgetDescription,
  PaginationConnectorParams
>;

/**
 * **Pagination** connector provides the logic to build a widget that will let the user
 * choose the current page of the results.
 *
 * When using the pagination with Algolia, you should be aware that the engine won't provide you pages
 * beyond the 1000th hits by default. You can find more information on the [Algolia documentation](https://www.algolia.com/doc/guides/searching/pagination/#pagination-limitations).
 */
const connectPagination: PaginationConnector = function connectPagination(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { totalPages, padding = 3 } = widgetParams || {};

    const pager = new Paginator({
      currentPage: 0,
      total: 0,
      padding,
    });

    type ConnectorState = {
      refine?(page: number): void;
      createURL?(state: SearchParameters): (page: number) => string;
    };

    const connectorState: ConnectorState = {};

    function getMaxPage({ nbPages }) {
      return totalPages !== undefined ? Math.min(totalPages, nbPages) : nbPages;
    }

    return {
      $$type: 'ais.pagination',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();

        return state.setQueryParameter('page', undefined);
      },

      getWidgetUiState(uiState, { searchParameters }) {
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

      getWidgetRenderState({ results, helper, createURL }) {
        if (!connectorState.refine) {
          connectorState.refine = page => {
            helper.setPage(page);
            helper.search();
          };
        }

        if (!connectorState.createURL) {
          connectorState.createURL = state => page =>
            createURL(state.setPage(page));
        }

        const state = helper.state;
        const page = state.page || 0;
        const nbPages = getMaxPage(results || { nbPages: 0 });
        pager.currentPage = page;
        pager.total = nbPages;

        return {
          createURL: connectorState.createURL(state),
          refine: connectorState.refine,
          canRefine: nbPages > 1,
          currentRefinement: page,
          nbHits: results?.nbHits || 0,
          nbPages,
          pages: results ? pager.pages() : [],
          isFirstPage: pager.isFirstPage(),
          isLastPage: pager.isLastPage(),
          widgetParams,
        };
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          pagination: this.getWidgetRenderState(renderOptions),
        };
      },
    };
  };
};

export default connectPagination;
