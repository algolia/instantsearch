/* eslint no-new: off */
import InstantSearch from '../InstantSearch';

describe('THROWAWAY: InstantSearch instanciation', () => {
  const appId = 'appId';
  const apiKey = 'apiKey';
  const indexName = 'indexName';

  describe('without search client', () => {
    it('and default parameters', () => {
      expect(() => {
        new InstantSearch({
          appId,
          apiKey,
          indexName,
        });
      }).not.toThrow();
    });

    it('and algolia client', () => {
      const fakeClient = {
        addAlgoliaAgent() {},
        search() {},
      };

      expect(() => {
        new InstantSearch({
          appId,
          apiKey,
          indexName,
          createAlgoliaClient: () => fakeClient,
        });
      }).not.toThrow();
    });
  });

  describe('with search client', () => {
    it('and nothing else', () => {
      expect(() => {
        new InstantSearch({
          searchClient: {},
        });
      }).not.toThrow();
    });

    it('and indexName', () => {
      expect(() => {
        new InstantSearch({
          indexName,
          searchClient: {},
        });
      }).not.toThrow();
    });

    it('and appId', () => {
      expect(() => {
        new InstantSearch({
          appId,
          searchClient: {},
        });
      }).toThrow();
    });

    it('and apiKey', () => {
      expect(() => {
        new InstantSearch({
          apiKey,
          searchClient: {},
        });
      }).toThrow();
    });

    it('and both appId, apiKey', () => {
      expect(() => {
        new InstantSearch({
          appId,
          apiKey,
          searchClient: {},
        });
      }).toThrow();
    });

    it('and indexname, appId, apiKey', () => {
      expect(() => {
        new InstantSearch({
          appId,
          apiKey,
          indexName,
          searchClient: {},
        });
      }).toThrow();
    });

    it('and createAlgoliaClient', () => {
      expect(() => {
        new InstantSearch({
          createAlgoliaClient: () => {},
          searchClient: {},
        });
      }).toThrow();
    });
  });
});
