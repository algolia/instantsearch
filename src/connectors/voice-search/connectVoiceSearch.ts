import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
} from '../../lib/utils';
import { Renderer, RenderOptions, WidgetFactory } from '../../types';
import createVoiceSearchHelper, {
  VoiceListeningState,
  ToggleListening,
} from '../../lib/voiceSearchHelper';

const withUsage = createDocumentationMessageGenerator({
  name: 'voice-search',
  connector: true,
});

export type VoiceSearchConnectorParams = {
  searchAsYouSpeak: boolean;
};

export interface VoiceSearchRenderOptions<TVoiceSearchWidgetParams>
  extends RenderOptions<TVoiceSearchWidgetParams> {
  isBrowserSupported: boolean;
  isListening: boolean;
  toggleListening: ToggleListening;
  voiceListeningState: VoiceListeningState;
}

export type VoiceSearchRenderer<TVoiceSearchWidgetParams> = Renderer<
  VoiceSearchRenderOptions<
    VoiceSearchConnectorParams & TVoiceSearchWidgetParams
  >
>;

export type VoiceSearchWidgetFactory<TVoiceSearchWidgetParams> = WidgetFactory<
  VoiceSearchConnectorParams & TVoiceSearchWidgetParams
>;

export type VoiceSearchConnector = <TVoiceSearchWidgetParams>(
  renderFn: VoiceSearchRenderer<TVoiceSearchWidgetParams>,
  unmountFn?: () => void
) => VoiceSearchWidgetFactory<TVoiceSearchWidgetParams>;

const connectVoiceSearch: VoiceSearchConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const render = ({
      isFirstRendering,
      instantSearchInstance,
      voiceSearchHelper: {
        isBrowserSupported,
        isListening,
        toggleListening,
        getState,
      },
    }): void => {
      renderFn(
        {
          isBrowserSupported: isBrowserSupported(),
          isListening: isListening(),
          toggleListening,
          voiceListeningState: getState(),
          widgetParams,
          instantSearchInstance,
        },
        isFirstRendering
      );
    };

    const { searchAsYouSpeak } = widgetParams;

    return {
      init({ helper, instantSearchInstance }) {
        (this as any)._refine = (query: string): void => {
          if (query !== helper.state.query) {
            helper.setQuery(query).search();
          }
        };

        (this as any)._voiceSearchHelper = createVoiceSearchHelper({
          searchAsYouSpeak,
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

        return state.setQueryParameter('query', undefined);
      },

      getWidgetState(uiState, { searchParameters }) {
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
        return searchParameters.setQueryParameter('query', uiState.query);
      },
    };
  };
};

export default connectVoiceSearch;
