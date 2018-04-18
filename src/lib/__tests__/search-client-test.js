import InstantSearch from '../InstantSearch';

describe('InstantSearch Search Client', () => {
  describe('Properties', () => {
    it('should have default `addAlgoliaAgent()` and `clearCache()` methods', () => {
      const search = new InstantSearch({
        indexName: '',
        searchClient: { search() {} },
      });

      expect(search.client.addAlgoliaAgent).toBeDefined();
      expect(search.client.clearCache).toBeDefined();
    });
  });

  describe('Lifecycle', () => {
    it('gets called on search', () => {
      const searchClientSpy = {
        search: jest.fn(),
      };

      const search = new InstantSearch({
        indexName: '',
        searchClient: searchClientSpy,
      });

      expect(searchClientSpy.search).not.toHaveBeenCalled();

      search.start();

      expect(search.helper.state.query).toBe('');
      expect(searchClientSpy.search).toHaveBeenCalledTimes(1);
    });

    it('calls the provided searchFunction when used', () => {
      const searchFunctionSpy = jest.fn(h => {
        h.setQuery('test').search();
      });

      const searchClientSpy = {
        search: jest.fn(),
      };

      const search = new InstantSearch({
        indexName: '',
        searchFunction: searchFunctionSpy,
        searchClient: searchClientSpy,
      });

      expect(searchFunctionSpy).not.toHaveBeenCalled();
      expect(searchClientSpy.search).not.toHaveBeenCalled();

      search.start();

      expect(searchFunctionSpy).toHaveBeenCalledTimes(1);
      expect(search.helper.state.query).toBe('test');
      expect(searchClientSpy.search).toHaveBeenCalledTimes(1);
      // expect(searchClientSpy.search).toHaveBeenCalledWith('test');
    });
  });
});
