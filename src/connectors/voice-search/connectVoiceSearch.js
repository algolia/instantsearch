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

        this._rerender = () => {};

        this._voiceSearchHelper = voiceSearchHelper({
          onQueryChange: query => this._refine(query),
          onStateChange: state => {
            this._voiceListeningState = state;
            this._rerender();
          },
        });

        this._toggleListening = searchAsYouSpeak => {
          const { isListening, start, stop } = this._voiceSearchHelper;
          if (isListening()) {
            stop();
          } else {
            start(searchAsYouSpeak);
          }
        };

        renderFn(
          {
            query: helper.state.query,
            isSupportedBrowser: this._voiceSearchHelper.isSupportedBrowser,
            isListening: this._voiceSearchHelper.isListening,
            toggleListening: this._toggleListening,
            voiceListeningState: this._voiceListeningState,
            widgetParams,
          },
          true
        );
      },
      render({ helper }) {
        this._rerender = () => {
          this.render({ helper });
        };

        renderFn(
          {
            query: helper.state.query,
            isSupportedBrowser: this._voiceSearchHelper.isSupportedBrowser,
            isListening: this._voiceSearchHelper.isListening,
            toggleListening: this._toggleListening,
            voiceListeningState: this._voiceListeningState,
            widgetParams,
          },
          false
        );
      },
      dispose({ state }) {
        unmountFn();
        return state.setQuery('');
      },
    };
  };
}
