import { PlainSearchParameters } from 'algoliasearch-helper';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Connector } from '../../types';
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

export type VoiceSearchRendererOptions = {
  isBrowserSupported: boolean;
  isListening: boolean;
  toggleListening: () => void;
  voiceListeningState: VoiceListeningState;
};

export type VoiceSearchConnector = Connector<
  VoiceSearchRendererOptions,
  VoiceSearchConnectorParams
>;

const connectVoiceSearch: VoiceSearchConnector = function connectVoiceSearch(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const render = ({
      isFirstRendering,
      instantSearchInstance,
      voiceSearchHelper: {
        isBrowserSupported,
        isListening,
        startListening,
        stopListening,
        getState,
      },
    }): void => {
      renderFn(
        {
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
          instantSearchInstance,
        },
        isFirstRendering
      );
    };

    const {
      searchAsYouSpeak = false,
      language,
      additionalQueryParameters,
      createVoiceSearchHelper = builtInCreateVoiceSearchHelper,
    } = widgetParams;

    return {
      $$type: 'ais.voiceSearch',

      init({ helper, instantSearchInstance }) {
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

        (this as any)._voiceSearchHelper = createVoiceSearchHelper({
          searchAsYouSpeak,
          language,
          onQueryChange: query => (this as any)._refine(query),
          onStateChange: () => {
            render({
              isFirstRendering: false,
              instantSearchInstance,
              voiceSearchHelper: (this as any)._voiceSearchHelper,
            });
          },
        });

        render({
          isFirstRendering: true,
          instantSearchInstance,
          voiceSearchHelper: (this as any)._voiceSearchHelper,
        });
      },

      render({ instantSearchInstance }) {
        render({
          isFirstRendering: false,
          instantSearchInstance,
          voiceSearchHelper: (this as any)._voiceSearchHelper,
        });
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
