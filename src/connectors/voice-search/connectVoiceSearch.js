import {
  checkRendering,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import voiceSearchHelper from '../../lib/voiceSearchHelper';

const withUsage = createDocumentationMessageGenerator({
  name: 'voice-search',
  connector: true,
});

export default function connectVoiceSearch(renderFn, unmountFn) {
  checkRendering(renderFn, withUsage());

  return (widgetParams = {}) => {
    const render = ({
      isFirstRendering,
      voiceSearchHelper: { isSupportedBrowser, isListening, toggle, getState },
    }) => {
      renderFn(
        {
          isSupportedBrowser,
          isListening,
          toggleListening: toggle,
          voiceListeningState: getState(),
          widgetParams,
        },
        isFirstRendering
      );
    };

    return {
      init({ helper }) {
        this._refine = (() => {
          let previousQuery;
          const setQueryAndSearch = query => {
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

        this._voiceSearchHelper = voiceSearchHelper({
          onQueryChange: query => this._refine(query),
          onStateChange: () => {
            render({
              isFirstRendering: false,
              voiceSearchHelper: this._voiceSearchHelper,
            });
          },
        });

        render({
          isFirstRendering: true,
          voiceSearchHelper: this._voiceSearchHelper,
        });
      },
      render() {
        render({
          isFirstRendering: false,
          voiceSearchHelper: this._voiceSearchHelper,
        });
      },
      dispose({ state }) {
        unmountFn();
        return state.setQuery('');
      },
    };
  };
}
