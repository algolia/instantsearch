import urlSync from '../url-sync.js';
import jsHelper from 'algoliasearch-helper';

jest.useFakeTimers();

const makeTestUrlUtils = () => ({
  url: '',
  lastQs: '',
  onpopstate(/* cb */) {
    // window.addEventListener('popstate', cb);
  },
  pushState(qs /* , {getHistoryState} */) {
    this.lastQs = qs;
    // window.history.pushState(getHistoryState(), '', getFullURL(this.createURL(qs)));
  },
  createURL(qs) {
    return qs;
  },
  readUrl() {
    // return window.location.search.slice(1);
    return this.url;
  },
});

describe('urlSync mechanics', () => {
  test('Generates urls on change', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} });
    const urlUtils = makeTestUrlUtils();
    const urlSyncWidget = urlSync({ urlUtils, threshold: 0 });
    urlSyncWidget.render({ helper });

    expect(urlUtils.lastQs).toEqual('');
    helper.setQuery('query');
    expect(urlUtils.lastQs).toEqual('');

    jest.runOnlyPendingTimers();

    expect(urlUtils.lastQs).toMatchSnapshot();
  });
  test('Generated urls should not contain a version', () => {
    const helper = jsHelper({ addAlgoliaAgent: () => {} });
    const urlUtils = makeTestUrlUtils();
    const urlSyncWidget = urlSync({ urlUtils, threshold: 0 });
    urlSyncWidget.render({ helper });
    helper.setQuery('query');

    jest.runOnlyPendingTimers();

    expect(urlUtils.lastQs).not.toEqual(expect.stringContaining('is_v'));
  });
});
