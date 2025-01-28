import { createDocumentationMessageGenerator, noop } from '../lib/public';
import { checkRendering } from '../lib/utils';
import builtInCreateVoiceSearchHelper from '../lib/voiceSearchHelper';

import type {
  CreateVoiceSearchHelper,
  VoiceListeningState,
} from '../lib/voiceSearchHelper/types';
import type { Connector, WidgetRenderState } from '../types';
import type { PlainSearchParameters } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'voice-search',
  connector: true,
});

export { type VoiceListeningState, type CreateVoiceSearchHelper };

export type VoiceSearchConnectorParams = {
  searchAsYouSpeak?: boolean;
  language?: string;
  additionalQueryParameters?: (params: {
    query: string;
  }) => PlainSearchParameters | void;
  createVoiceSearchHelper?: CreateVoiceSearchHelper;
};

export type VoiceSearchRenderState = {
  isBrowserSupported: boolean;
  isListening: boolean;
  toggleListening: () => void;
  voiceListeningState: VoiceListeningState;
};

export type VoiceSearchWidgetDescription = {
  $$type: 'ais.voiceSearch';
  renderState: VoiceSearchRenderState;
  indexRenderState: {
    voiceSearch: WidgetRenderState<
      VoiceSearchRenderState,
      VoiceSearchConnectorParams
    >;
  };
  indexUiState: {
    query: string;
  };
};

export type VoiceSearchConnector = Connector<
  VoiceSearchWidgetDescription,
  VoiceSearchConnectorParams
>;

export const connectVoiceSearch: VoiceSearchConnector =
  function connectVoiceSearch(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        searchAsYouSpeak = false,
        language,
        additionalQueryParameters,
        createVoiceSearchHelper = builtInCreateVoiceSearchHelper,
      } = widgetParams;

      return {
        $$type: 'ais.voiceSearch',

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

        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            voiceSearch: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState(renderOptions) {
          const { helper, instantSearchInstance } = renderOptions;
          if (!(this as any)._refine) {
            (this as any)._refine = (query: string): void => {
              if (query !== helper.state.query) {
                const queryLanguages = language
                  ? [language.split('-')[0]]
                  : undefined;
                // @ts-ignore queryLanguages is allowed to be a string, not just an array
                helper.setQueryParameter('queryLanguages', queryLanguages);

                if (typeof additionalQueryParameters === 'function') {
                  helper.setState(
                    // These parameters are only set with a refine, so they are not persisted.
                    // If a searchbox query happens, the parameters are reset.
                    helper.state.setQueryParameters({
                      ignorePlurals: true,
                      removeStopWords: true,
                      // @ts-ignore optionalWords is allowed to be a string too
                      optionalWords: query,
                      ...additionalQueryParameters({ query }),
                    })
                  );
                }

                helper.setQuery(query).search();
              }
            };
          }

          if (!(this as any)._voiceSearchHelper) {
            (this as any)._voiceSearchHelper = createVoiceSearchHelper({
              searchAsYouSpeak,
              language,
              onQueryChange: (query) => (this as any)._refine(query),
              onStateChange: () => {
                renderFn(
                  {
                    ...this.getWidgetRenderState(renderOptions),
                    instantSearchInstance,
                  },
                  false
                );
              },
            });
          }

          const {
            isBrowserSupported,
            isListening,
            startListening,
            stopListening,
            getState,
          } = (this as any)._voiceSearchHelper;

          return {
            isBrowserSupported: isBrowserSupported(),
            isListening: isListening(),
            toggleListening() {
              if (!isBrowserSupported()) {
                return;
              }
              if (isListening()) {
                stopListening();
              } else {
                startListening();
              }
            },
            voiceListeningState: getState(),
            widgetParams,
          };
        },

        dispose() {
          (this as any)._voiceSearchHelper?.dispose();

          unmountFn();
        },

        getWidgetUiState(uiState, { searchParameters }) {
          const query = searchParameters.query || '';

          if (!query) {
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
