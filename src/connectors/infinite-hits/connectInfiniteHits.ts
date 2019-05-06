import escapeHits, { TAG_PLACEHOLDER } from '../../lib/escape-highlight';
import {
  Renderer,
  RenderOptions,
  WidgetFactory,
  Hits,
  Unmounter,
  Helper,
  SearchParameters,
} from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  isEqual,
  addAbsolutePosition,
  addQueryID,
  noop,
} from '../../lib/utils';
import { InfiniteHitsRendererWidgetParams } from '../../widgets/infinite-hits/infinite-hits';

export type InfiniteHitsConnectorParams = Partial<
  InfiniteHitsRendererWidgetParams
>;

export interface InfiniteHitsRenderOptions<TInfiniteHitsWidgetParams>
  extends RenderOptions<TInfiniteHitsWidgetParams> {
  showPrevious: () => void;
  showMore: () => void;
  isFirstPage: boolean;
  isLastPage: boolean;
}

export type InfiniteHitsRenderer<TInfiniteHitsWidgetParams> = Renderer<
  InfiniteHitsRenderOptions<
    InfiniteHitsConnectorParams & TInfiniteHitsWidgetParams
  >
>;

export type InfiniteHitsWidgetFactory<
  TInfiniteHitsWidgetParams
> = WidgetFactory<InfiniteHitsConnectorParams & TInfiniteHitsWidgetParams>;

export type InfiniteHitsConnector = <TInfiniteHitsWidgetParams>(
  render: InfiniteHitsRenderer<TInfiniteHitsWidgetParams>,
  unmount?: Unmounter
) => InfiniteHitsWidgetFactory<TInfiniteHitsWidgetParams>;

const withUsage = createDocumentationMessageGenerator({
  name: 'infinite-hits',
  connector: true,
});

/**
 * @typedef {Object} InfiniteHitsRenderingOptions
 * @property {Array<Object>} hits The aggregated matched hits from Algolia API of all pages.
 * @property {Object} results The complete results response from Algolia API.
 * @property {function} showMore Loads the next page of hits.
 * @property {boolean} isLastPage Indicates if the last page of hits has been reached.
 * @property {Object} widgetParams All original widget options forwarded to the `renderFn`.
 */

/**
 * @typedef {Object} CustomInfiniteHitsWidgetOptions
 * @property {boolean} [escapeHTML = true] Whether to escape HTML tags from `hits[i]._highlightResult`.
 * @property {function(object[]):object[]} [transformItems] Function to transform the items passed to the templates.
 */

/**
 * **InfiniteHits** connector provides the logic to create custom widgets that will render an continuous list of results retrieved from Algolia.
 *
 * This connector provides a `InfiniteHitsRenderingOptions.showMore()` function to load next page of matched results.
 * @type {Connector}
 * @param {function(InfiniteHitsRenderingOptions, boolean)} renderFn Rendering function for the custom **InfiniteHits** widget.
 * @param {function} unmountFn Unmount function called when the widget is disposed.
 * @return {function(CustomInfiniteHitsWidgetOptions)} Re-usable widget factory for a custom **InfiniteHits** widget.
 * @example
 * // custom `renderFn` to render the custom InfiniteHits widget
 * function renderFn(InfiniteHitsRenderingOptions, isFirstRendering) {
 *   if (isFirstRendering) {
 *     InfiniteHitsRenderingOptions.widgetParams.containerNode
 *       .html('<div id="hits"></div><button id="show-more">Load more</button>');
 *
 *     InfiniteHitsRenderingOptions.widgetParams.containerNode
 *       .find('#show-more')
 *       .on('click', function(event) {
 *         event.preventDefault();
 *         InfiniteHitsRenderingOptions.showMore();
 *       });
 *   }
 *
 *   InfiniteHitsRenderingOptions.widgetParams.containerNode.find('#hits').html(
 *     InfiniteHitsRenderingOptions.hits.map(function(hit) {
 *       return '<div>' + hit._highlightResult.name.value + '</div>';
 *     })
 *   );
 * };
 *
 * // connect `renderFn` to InfiniteHits logic
 * var customInfiniteHits = instantsearch.connectors.connectInfiniteHits(renderFn);
 *
 * // mount widget on the page
 * search.addWidget(
 *   customInfiniteHits({
 *     containerNode: $('#custom-infinite-hits-container'),
 *   })
 * );
 */
const connectInfiniteHits: InfiniteHitsConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      escapeHTML = true,
      transformItems = (items: any[]) => items,
      showPrevious = false,
    } = widgetParams || {};
    let hitsCache: Hits = [];
    let firstReceivedPage = Infinity;
    let lastReceivedPage = -1;
    let prevState: Partial<SearchParameters>;

    const getShowPrevious = (helper: Helper): (() => void) => () => {
      // Using the helper's `overrideStateWithoutTriggeringChangeEvent` method
      // avoid updating the browser URL when the user displays the previous page.
      helper
        .overrideStateWithoutTriggeringChangeEvent({
          ...helper.state,
          page: firstReceivedPage - 1,
        })
        .search();
    };
    const getShowMore = (helper: Helper): (() => void) => () => {
      helper.setPage(lastReceivedPage + 1).search();
    };

    return {
      getConfiguration() {
        return escapeHTML ? TAG_PLACEHOLDER : {};
      },

      init({ instantSearchInstance, helper }) {
        (this as any).showPrevious = getShowPrevious(helper);
        (this as any).showMore = getShowMore(helper);
        firstReceivedPage = helper.state.page as number;
        lastReceivedPage = helper.state.page as number;

        renderFn(
          {
            hits: hitsCache,
            results: undefined,
            showPrevious: (this as any).showPrevious,
            showMore: (this as any).showMore,
            isFirstPage: firstReceivedPage === 0,
            isLastPage: true,
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, state, instantSearchInstance }) {
        // Reset cache and received pages if anything changes in the
        // search state, except for the page.
        //
        // We're doing this to "reset" the widget if a refinement or the
        // query changes between renders, but we want to keep it as is
        // if we only change pages.
        const { page, ...currentState } = state;
        if (!isEqual(currentState, prevState)) {
          hitsCache = [];
          firstReceivedPage = page as number;
          lastReceivedPage = page as number;
          prevState = currentState;
        }

        if (escapeHTML && results.hits && results.hits.length > 0) {
          results.hits = escapeHits(results.hits);
        }

        results.hits = addAbsolutePosition(
          results.hits,
          results.page,
          results.hitsPerPage
        );

        results.hits = addQueryID(results.hits, results.queryID);

        results.hits = transformItems(results.hits);

        if (lastReceivedPage < (page as number) || !hitsCache.length) {
          hitsCache = [...hitsCache, ...results.hits];
          lastReceivedPage = page as number;
        } else if (firstReceivedPage > (page as number)) {
          hitsCache = [...results.hits, ...hitsCache];
          firstReceivedPage = page as number;
        }

        const isFirstPage = firstReceivedPage === 0;
        const isLastPage = results.nbPages <= results.page + 1;

        renderFn(
          {
            hits: hitsCache,
            results,
            showPrevious: (this as any).showPrevious,
            showMore: (this as any).showMore,
            isFirstPage,
            isLastPage,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose() {
        unmountFn();
      },

      getWidgetState(uiState, { searchParameters }) {
        const page = searchParameters.page as number;

        if (!showPrevious || page === 0 || page + 1 === uiState.page) {
          return uiState;
        }

        return {
          ...uiState,
          page: page + 1,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        if (!showPrevious) {
          return searchParameters;
        }
        const uiPage = uiState.page;
        if (uiPage) {
          return searchParameters.setQueryParameter('page', uiPage - 1);
        }
        return searchParameters.setQueryParameter('page', 0);
      },
    };
  };
};

export default connectInfiniteHits;
