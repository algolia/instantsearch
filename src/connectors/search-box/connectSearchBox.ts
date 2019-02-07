import { RenderOptions, Renderer, CreateWidget } from '../../types';
import { checkRendering } from '../../lib/utils';

export interface SearchBoxRenderOptions<T> extends RenderOptions<T> {
  query: string;
  isSearchStalled: boolean;
  refine: (query: string) => void;
  clear: () => void;
  onHistoryChange: (callback: (state: any) => void) => void;
}

export interface SearchBoxConnectorParams {
  queryHook?: (value: string, search: (value: string) => void) => void;
}

export type CreateSearchBox<T> = CreateWidget<SearchBoxConnectorParams & T>;

export type SearchBoxRenderer<T> = Renderer<
  SearchBoxRenderOptions<SearchBoxConnectorParams & T>
>;

export type ConnectSearchBox = {
  <T>(render: SearchBoxRenderer<T>, unmount: () => void): CreateSearchBox<T>;
};

const connectSearchBox: ConnectSearchBox = (renderFn, unmountFn) => {
  checkRendering(renderFn, 'Error');

  return widgetParams => {
    const { queryHook = null } = widgetParams || {};

    function clear(helper) {
      return function() {
        helper.setQuery('');
        helper.search();
      };
    }

    return {
      _clear() {},
      _cachedClear() {
        (this as any)._clear();
      },

      init({ helper, onHistoryChange, instantSearchInstance }) {
        (this as any)._cachedClear = (this as any)._cachedClear.bind(this);
        (this as any)._clear = clear(helper);

        (this as any)._refine = (() => {
          let previousQuery;

          const setQueryAndSearch = (q, doSearch = true) => {
            if (q !== helper.state.query) {
              previousQuery = helper.state.query;
              helper.setQuery(q);
            }
            if (doSearch && previousQuery !== undefined && previousQuery !== q)
              helper.search();
          };

          return queryHook
            ? q => queryHook(q, setQueryAndSearch)
            : setQueryAndSearch;
        })();

        (this as any)._onHistoryChange = onHistoryChange;

        renderFn(
          {
            query: helper.state.query,
            onHistoryChange: (this as any)._onHistoryChange,
            refine: (this as any)._refine,
            clear: (this as any)._cachedClear,
            widgetParams,
            instantSearchInstance,
            isSearchStalled: false,
          },
          true
        );
      },

      render({ helper, instantSearchInstance, searchMetadata }) {
        (this as any)._clear = clear(helper);

        renderFn(
          {
            query: helper.state.query,
            onHistoryChange: (this as any)._onHistoryChange,
            refine: (this as any)._refine,
            clear: (this as any)._cachedClear,
            widgetParams,
            instantSearchInstance,
            isSearchStalled: searchMetadata.isSearchStalled,
          },
          false
        );
      },

      dispose({ state }) {
        unmountFn();
        return state.setQuery('');
      },

      getWidgetState(uiState, { searchParameters }) {
        const query = searchParameters.query;

        if (query === '' || (uiState && uiState.query === query)) {
          return uiState;
        }

        return {
          ...uiState,
          query,
        };
      },

      getWidgetSearchParameters(searchParameters, { uiState }) {
        return searchParameters.setQuery(uiState.query || '');
      },
    };
  };
};

export default connectSearchBox;
