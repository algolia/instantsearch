import sinon from 'sinon';

// import algoliaSearchHelper from 'algoliasearch-helper';
import InstantSearch from '../InstantSearch';

const appId = 'appId';
const apiKey = 'apiKey';
const indexName = 'lifecycle';

describe.only('InstantSearch lifecycle', () => {
  it('calls the provided searchFunction when used', () => {
    const searchFunctionSpy = sinon.spy(h => {
      h.setQuery('test').search();
    });

    const fakeClient = {
      search: sinon.spy(),
      addAlgoliaAgent: () => {},
    };

    const search = new InstantSearch({
      appId,
      apiKey,
      indexName,
      searchFunction: searchFunctionSpy,
      createAlgoliaClient: () => fakeClient,
    });

    expect(searchFunctionSpy.callCount).toBe(0);
    expect(fakeClient.search.callCount).toBe(0);

    search.start();

    expect(searchFunctionSpy.callCount).toBe(1);
    expect(search.helper.state.query).toBe('test');
    expect(fakeClient.search.callCount).toBe(1);
  });
});
