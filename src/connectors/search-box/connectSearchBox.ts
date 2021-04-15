import { AlgoliaSearchHelper } from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Connector, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'search-box',
  connector: true,
});

export type SearchBoxConnectorParams = {
  /**
   * A function that will be called every time
   * a new value for the query is set. The first parameter is the query and the second is a
   * function to actually trigger the search. The function takes the query as the parameter.
   *
   * This queryHook can be used to debounce the number of searches done from the searchBox.
   */
  queryHook?: (query: string, hook: (value: string) => void) => void;
};

/**
 * @typedef {Object} CustomSearchBoxWidgetParams
 * @property {function(string, function(string))} [queryHook = undefined] A function that will be called every time
 * a new value for the query is set. The first parameter is the query and the second is a
 * function to actually trigger the search. The function takes the query as the parameter.
 *
 * This queryHook can be used to debounce the number of searches done from the searchBox.
 */

export type SearchBoxRenderState = {
  /**
   * The query from the last search.
   */
  query: string;
  /**
   * Sets a new query and searches.
   */
  refine: (value: string) => void;
  /**
   * Remove the query and perform search.
   */
  clear: () => void;
  /**
   * `true` if the search results takes more than a certain time to come back
   * from Algolia servers. This can be configured on the InstantSearch constructor with the attribute
   * `stalledSearchDelay` which is 200ms, by default.
   */
  isSearchStalled: boolean;
};

export type SearchBoxWidgetDescription = {
  $$type: 'ais.searchBox';
  renderState: SearchBoxRenderState;
  indexRenderState: {
    searchBox: WidgetRenderState<
      SearchBoxRenderState,
      SearchBoxConnectorParams
    >;
  };
  indexUiState: {
    query: string;
  };
};

export type SearchBoxConnector = Connector<
  SearchBoxWidgetDescription,
  SearchBoxConnectorParams
>;

/**
 * **SearchBox** connector provides the logic to build a widget that will let the user search for a query.
 *
 * The connector provides to the rendering: `refine()` to set the query. The behaviour of this function
 * may be impacted by the `queryHook` widget parameter.
 */
const connectSearchBox: SearchBoxConnector = function connectSearchBox(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const { queryHook } = widgetParams || {};

    function clear(helper: AlgoliaSearchHelper) {
      return function() {
        helper.setQuery('').search();
      };
    }

    let _refine: SearchBoxRenderState['refine'];
    let _clear = () => {};
    function _cachedClear() {
      _clear();
    }

    return {
      $$type: 'ais.searchBox',

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

        return state.setQueryParameter('query', undefined);
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          searchBox: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState({ helper, searchMetadata }) {
        if (!_refine) {
          const setQueryAndSearch = (query: string) => {
            if (query !== helper.state.query) {
              helper.setQuery(query).search();
            }
          };

          _refine = query => {
            if (queryHook) {
              queryHook(query, setQueryAndSearch);
              return;
            }

            setQueryAndSearch(query);
          };
        }

        _clear = clear(helper);

        return {
          query: helper.state.query || '',
          refine: _refine,
          clear: _cachedClear,
          widgetParams,
          isSearchStalled: searchMetadata.isSearchStalled,
        };
      },

      getWidgetUiState(uiState, { searchParameters }) {
        const query = searchParameters.query || '';

        if (query === '' || (uiState && uiState.query === query)) {
          return uiState;
        }

        return {
          ...uiState,
          query,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQueryParameter('query', uiState.query || '');
      },
    };
  };
};

export default connectSearchBox;
