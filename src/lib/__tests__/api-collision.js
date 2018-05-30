/* eslint no-new: off */
import InstantSearch from '../InstantSearch';

const usage = `
Usage: instantsearch({
  indexName: 'my_index_name',
  searchClient: algoliasearch('appId', 'apiKey')
});`;

// THROWAWAY: Test suite to remove once the next major version is released
describe('InstantSearch API collision', () => {
  describe('with search client', () => {
    const appId = 'appId';
    const apiKey = 'apiKey';
    const indexName = 'indexName';
    const searchClient = { search() {} };

    it('and indexName', () => {
      expect(() => {
        new InstantSearch({
          indexName,
          searchClient,
        });
      }).not.toThrow();
    });

    it('and nothing else', () => {
      expect(() => {
        new InstantSearch({
          searchClient,
        });
      }).toThrow(usage);
    });

    it('and appId', () => {
      expect(() => {
        new InstantSearch({
          appId,
          searchClient,
        });
      }).toThrow(usage);
    });

    it('and apiKey', () => {
      expect(() => {
        new InstantSearch({
          apiKey,
          searchClient,
        });
      }).toThrow(usage);
    });

    it('and createAlgoliaClient', () => {
      expect(() => {
        new InstantSearch({
          createAlgoliaClient: () => {},
          searchClient,
        });
      }).toThrow(usage);
    });
  });
});
