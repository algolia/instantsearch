import noop from 'lodash/noop';
import {
  checkRendering,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { Renderer, RenderOptions, WidgetFactory } from '../../types';
import voiceSearchHelper, {
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
        (this as any)._refine = (() => {
          let previousQuery: string | undefined;
          const setQueryAndSearch = (query: string): void => {
            if (query !== helper.state.query) {
              previousQuery = helper.state.query;
              helper.setQuery(query);
            }
            if (
              typeof previousQuery !== 'undefined' &&
              previousQuery !== query
            ) {
              helper.search();
            }
          };
          return setQueryAndSearch;
        })();
        (this as any)._voiceSearchHelper = voiceSearchHelper({
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

export default connectVoiceSearch;
