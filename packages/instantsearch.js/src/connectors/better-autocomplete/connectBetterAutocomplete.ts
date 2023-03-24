/* eslint-disable no-console */

import { createAutocomplete } from '@algolia/autocomplete-core';
import { getAlgoliaResults } from '@algolia/autocomplete-preset-algolia';

import { noop } from '../../lib/utils';

import type { BaseHit, Connector, WidgetRenderState } from '../../types';
import type {
  AutocompleteApi,
  AutocompleteCollection,
  AutocompleteState,
} from '@algolia/autocomplete-core';

export type BetterAutocompleteConnectorParams = {
  indexName?: string;
  hitsPerPage?: number;
};

export type BetterAutocompleteRenderState = {
  autocomplete: AutocompleteApi<BaseHit>;
  state: AutocompleteState<BaseHit>;
  collections: Array<AutocompleteCollection<BaseHit>>;
};

export type BetterAutocompleteWidgetDescription = {
  $$type: 'ais.betterAutocomplete';
  renderState: BetterAutocompleteRenderState;
  indexRenderState: {
    betterAutocomplete: WidgetRenderState<
      BetterAutocompleteRenderState,
      BetterAutocompleteConnectorParams
    >;
  };
  indexUiState: { query: string };
};

export type BetterAutocompleteConnector = Connector<
  BetterAutocompleteWidgetDescription,
  BetterAutocompleteConnectorParams
>;

const connectBetterAutocomplete: BetterAutocompleteConnector =
  function connectBetterAutocomplete(renderFn, unmountFn = noop) {
    return (widgetParams) => {
      let autocompleteApi: AutocompleteApi<BaseHit> | undefined;
      let autocompleteState: AutocompleteState<BaseHit> | undefined;

      return {
        $$type: 'ais.betterAutocomplete',

        init(initOptions) {
          console.log('[connector] init', { widgetParams });
          const { instantSearchInstance, helper } = initOptions;
          const { indexName = helper.getIndex(), hitsPerPage = 5 } =
            widgetParams || {};

          autocompleteApi = createAutocomplete({
            onStateChange: ({ state }) => {
              console.log('[connector] onStateChange', {
                state,
              });
              autocompleteState = state;

              // This forces a render when Autocomplete state changes
              // Is it enough?
              this.render({ instantSearchInstance });
            },
            openOnFocus: true,
            shouldPanelOpen() {
              return true;
            },
            getSources() {
              return [
                {
                  sourceId: 'algolia_items',
                  getItems({ query }) {
                    return getAlgoliaResults({
                      searchClient: instantSearchInstance.client,
                      queries: [
                        {
                          indexName,
                          query,
                          params: {
                            hitsPerPage,
                          },
                        },
                      ],
                    });
                  },
                },
                // {
                //   sourceId: 'static_items',
                //   getItems({ query }) {
                //     return [
                //       { name: `hello ${query}` },
                //       {
                //         name: `world ${query}`,
                //       },
                //     ];
                //   },
                // },
              ];
            },
          });

          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance,
            },
            true
          );
        },

        render(renderOptions) {
          console.log('[connector] render');
          const { instantSearchInstance } = renderOptions;

          renderFn(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance,
            },
            false
          );
        },

        getRenderState(renderState, renderOptions) {
          // console.log('[connector] getRenderState');
          return {
            ...renderState,
            betterAutocomplete: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState() {
          // console.log('[connector] getWidgetRenderState');

          return {
            autocomplete: autocompleteApi,
            state: autocompleteState,
            collections: autocompleteState?.collections || [],
            widgetParams,
          };
        },

        getWidgetUiState(uiState) {
          // console.log('[connector] getWidgetUiState');
          return {
            ...uiState,
          };
        },

        getWidgetSearchParameters(searchParameters) {
          // console.log('[connector] getWidgetSearchParameters');
          return searchParameters;
        },

        dispose() {
          console.log('[connector] dispose');
          unmountFn();
        },
      };
    };
  };

export default connectBetterAutocomplete;
