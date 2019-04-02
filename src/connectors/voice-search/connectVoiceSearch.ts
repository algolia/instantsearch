import noop from 'lodash/noop';
import {
  checkRendering,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { Renderer, RenderOptions, WidgetFactory } from '../../types';
import voiceSearchHelper from '../../lib/voiceSearchHelper';
import { VoiceListeningState } from '../../widgets/voice-search/voice-search';

const withUsage = createDocumentationMessageGenerator({
  name: 'voice-search',
  connector: true,
});

export interface VoiceSearchRenderOptions extends RenderOptions {
  isSupportedBrowser: () => boolean;
  isListening: () => boolean;
  toggleListening: ({ searchAsYouSpeak: boolean }) => void;
  voiceListeningState: VoiceListeningState;
}

export type VoiceSearchRenderer = Renderer<VoiceSearchRenderOptions>;

export type VoiceSearchWidgetFactory = WidgetFactory<any>;

export type VoiceSearchConnector = (
  renderFn: VoiceSearchRenderer,
  unmountFn?: () => void
) => VoiceSearchWidgetFactory;

const connectVoiceSearch: VoiceSearchConnector = (
  renderFn,
  unmountFn = noop
) => {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const render = ({
      isFirstRendering,
      instantSearchInstance,
      voiceSearchHelper: {
        isSupportedBrowser,
        isListening,
        toggleListening,
        getState,
      },
    }) => {
      renderFn(
        {
          isSupportedBrowser,
          isListening,
          toggleListening,
          voiceListeningState: getState(),
          widgetParams,
          instantSearchInstance,
        },
        isFirstRendering
      );
    };

    return {
      init({ helper, instantSearchInstance }) {
        (this as any)._refine = (() => {
          let previousQuery: string | undefined;
          const setQueryAndSearch = (query: string) => {
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
          onQueryChange: (query: string) => (this as any)._refine(query),
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
    };
  };
};

export default connectVoiceSearch;
