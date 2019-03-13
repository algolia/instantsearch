import {
  checkRendering,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

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
            if (previousQuery !== undefined && previousQuery !== query) {
              helper.search();
            }
          };

          return setQueryAndSearch;
        })();
        renderFn(
          {
            query: helper.state.query,
            refine: this._refine,
            widgetParams,
          },
          true
        );
      },
      render({ helper }) {
        renderFn(
          {
            query: helper.state.query,
            refine: this._refine,
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
