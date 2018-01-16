// import algoliaSearchHelper from 'algoliasearch-helper';
import InstantSearch from '../InstantSearch';

describe('InstantSearch lifecycle', () => {
  it('emits an error if the API returns an error', () => {
    const search = new InstantSearch({
      // correct credentials so that the client does not retry
      appId: 'latency',
      apiKey: '6be0576ff61c053d5f9a3225e2a90f76',
      // the index name does not exist so that we get an error
      indexName: 'DOESNOTEXIST',
    });

    let sendError;
    let reject;
    const waitForError = new Promise((resolve, r) => {
      sendError = resolve;
      reject = r;
    });

    search.on('error', e => {
      try {
        expect(e).toEqual(expect.any(Error));
      } catch (err) {
        reject(err);
      }
      sendError();
    });

    search.addWidget({
      render: () => {},
    });

    search.start();

    return waitForError;
  });
});
