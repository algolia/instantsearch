import { createDocumentationMessageGenerator, noop } from '../lib/public';
import { checkRendering } from '../lib/utils';

import type { Connector, WidgetRenderState } from '../types';

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

const defaultQueryHook: SearchBoxConnectorParams['queryHook'] = (query, hook) =>
  hook(query);

/**
 * **SearchBox** connector provides the logic to build a widget that will let the user search for a query.
 *
 * The connector provides to the rendering: `refine()` to set the query. The behaviour of this function
 * may be impacted by the `queryHook` widget parameter.
 */
export const connectSearchBox: SearchBoxConnector = function connectSearchBox(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const { queryHook = defaultQueryHook } = widgetParams || {};

    let _refine: SearchBoxRenderState['refine'];
    let _clear: SearchBoxRenderState['clear'];

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

      getWidgetRenderState({ helper, state }) {
        if (!_refine) {
          _refine = (query) => {
            queryHook(query, (q) => helper.setQuery(q).search());
          };

          _clear = () => {
            helper.setQuery('').search();
          };
        }

        return {
          query: state.query || '',
          refine: _refine,
          clear: _clear,
          widgetParams,
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
