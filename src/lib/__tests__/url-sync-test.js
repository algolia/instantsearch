import urlSync from '../url-sync';
import jsHelper from 'algoliasearch-helper';
const SearchParameters = jsHelper.SearchParameters;

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
    const helper = jsHelper({});
    const urlUtils = makeTestUrlUtils();
    const urlSyncWidget = urlSync({ urlUtils, threshold: 0 });
    urlSyncWidget.init({ state: SearchParameters.make({}) });
    urlSyncWidget.render({ helper, state: helper.state });

    expect(urlUtils.lastQs).toEqual('');
    helper.setQuery('query');
    expect(urlUtils.lastQs).toEqual('');

    jest.runOnlyPendingTimers();

    expect(urlUtils.lastQs).toMatchSnapshot();
  });
  test('Generated urls should not contain a version', () => {
    const helper = jsHelper({});
    const urlUtils = makeTestUrlUtils();
    const urlSyncWidget = urlSync({ urlUtils, threshold: 0 });
    urlSyncWidget.init({ state: SearchParameters.make({}) });
    urlSyncWidget.render({ helper, state: helper.state });
    helper.setQuery('query');

    jest.runOnlyPendingTimers();

    expect(urlUtils.lastQs).not.toEqual(expect.stringContaining('is_v'));
  });
  test('updates the URL during the first rendering if it has change since the initial configuration', () => {
    const helper = jsHelper({});
    const urlUtils = makeTestUrlUtils();
    const urlSyncWidget = urlSync({ urlUtils, threshold: 0 });
    urlSyncWidget.init({ state: SearchParameters.make({}) });

    // In this scenario, there should have been a search here
    // but it was prevented by a search function
    helper.setQuery('query');
    // the change even is setup at the first rendering
    urlSyncWidget.render({ helper, state: helper.state });

    // because the state has changed before the first rendering,
    // we expect the URL to be updated
    jest.runOnlyPendingTimers();
    expect(urlUtils.lastQs).toMatchSnapshot();
  });
});
