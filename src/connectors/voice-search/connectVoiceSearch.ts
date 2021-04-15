import { PlainSearchParameters } from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Connector, WidgetRenderState } from '../../types';
import builtInCreateVoiceSearchHelper from '../../lib/voiceSearchHelper';
import {
  CreateVoiceSearchHelper,
  VoiceListeningState,
} from '../../lib/voiceSearchHelper/types';

const withUsage = createDocumentationMessageGenerator({
  name: 'voice-search',
  connector: true,
});

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

const connectVoiceSearch: VoiceSearchConnector = function connectVoiceSearch(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
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
              helper.setQueryParameter('queryLanguages', queryLanguages);

              if (typeof additionalQueryParameters === 'function') {
                helper.setState(
                  helper.state.setQueryParameters({
                    ignorePlurals: true,
                    removeStopWords: true,
                    // @ts-ignore (optionalWords only allows array, while string is also valid)
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
            onQueryChange: query => (this as any)._refine(query),
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

      dispose({ state }) {
        (this as any)._voiceSearchHelper.dispose();

        unmountFn();

        let newState = state;
        if (typeof additionalQueryParameters === 'function') {
          const additional = additionalQueryParameters({ query: '' });
          const toReset = additional
            ? Object.keys(additional).reduce((acc, current) => {
                acc[current] = undefined;
                return acc;
              }, {})
            : {};
          newState = state.setQueryParameters({
            // @ts-ignore (queryLanguages is not yet added to algoliasearch)
            queryLanguages: undefined,
            ignorePlurals: undefined,
            removeStopWords: undefined,
            optionalWords: undefined,
            ...toReset,
          });
        }

        return newState.setQueryParameter('query', undefined);
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
        return searchParameters.setQueryParameter('query', uiState.query || '');
      },
    };
  };
};

export default connectVoiceSearch;
