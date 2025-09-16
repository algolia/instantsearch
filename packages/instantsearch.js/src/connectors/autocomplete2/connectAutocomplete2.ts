import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';

import type { Connector, WidgetRenderState } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'autocomplete2',
  connector: true,
});

export type Autocomplete2ConnectorParams = {
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

export type Autocomplete2RenderState = {
  /**
   * The query from the last search.
   */
  query: string;
  /**
   * Sets a new query and searches.
   */
  submit: (value: string) => void;
  /**
   * Remove the query and perform search.
   */
  clear: () => void;
  /**
   * `true` if the search results takes more than a certain time to come back
   * from Algolia servers. This can be configured on the InstantSearch constructor with the attribute
   * `stalledSearchDelay` which is 200ms, by default.
   * @deprecated use `instantSearchInstance.status` instead
   */
  isSearchStalled: boolean;
};

export type Autocomplete2WidgetDescription = {
  $$type: 'ais.autocomplete2';
  renderState: Autocomplete2RenderState;
  indexRenderState: {
    autocomplete2: WidgetRenderState<
      Autocomplete2RenderState,
      Autocomplete2ConnectorParams
    >;
  };
  indexUiState: {
    query: string;
  };
};

export type Autocomplete2Connector = Connector<
  Autocomplete2WidgetDescription,
  Autocomplete2ConnectorParams
>;

const defaultQueryHook: Autocomplete2ConnectorParams['queryHook'] = (
  query,
  hook
) => hook(query);

/**
 * **Autocomplete2** connector provides the logic to build a widget that will let the user search for a query.
 *
 * The connector provides to the rendering: `refine()` to set the query. The behaviour of this function
 * may be impacted by the `queryHook` widget parameter.
 */
const connectAutocomplete2: Autocomplete2Connector =
  function connectAutocomplete2(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const { queryHook = defaultQueryHook } = widgetParams || {};

      let _submit: Autocomplete2RenderState['submit'];
      let _clear: Autocomplete2RenderState['clear'];

      return {
        $$type: 'ais.autocomplete2',

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
            autocomplete2: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState({ helper, instantSearchInstance, state }) {
          if (!_submit) {
            _submit = (query) => {
              queryHook(query, (q) => helper.setQuery(q).search());
            };

            _clear = () => {
              helper.setQuery('').search();
            };
          }

          return {
            query: state.query || '',
            submit: _submit,
            clear: _clear,
            widgetParams,
            isSearchStalled: instantSearchInstance.status === 'stalled',
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
          return searchParameters.setQueryParameter(
            'query',
            uiState.query || ''
          );
        },
      };
    };
  };

export default connectAutocomplete2;
