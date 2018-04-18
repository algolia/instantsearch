/* eslint no-new: off */
import InstantSearch from '../InstantSearch';

// FIXME: Test suite to remove once the next major version is released
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
      }).toThrow();
    });

    it('and appId', () => {
      expect(() => {
        new InstantSearch({
          appId,
          searchClient,
        });
      }).toThrow();
    });

    it('and apiKey', () => {
      expect(() => {
        new InstantSearch({
          apiKey,
          searchClient,
        });
      }).toThrow();
    });

    it('and createAlgoliaClient', () => {
      expect(() => {
        new InstantSearch({
          createAlgoliaClient: () => {},
          searchClient,
        });
      }).toThrow();
    });
  });
});
