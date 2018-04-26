import InstantSearch from '../InstantSearch';

describe('InstantSearch Search Client', () => {
  describe('Properties', () => {
    it('throws if no `search()` method', () => {
      expect(() => {
        // eslint-disable-next-line no-new
        new InstantSearch({
          indexName: '',
          searchClient: {},
        });
      }).toThrowErrorMatchingSnapshot();
    });
  });

  describe('Lifecycle', () => {
    it('gets called on search', () => {
      const searchClientSpy = {
        search: jest.fn(() => Promise.resolve({ results: [{}] })),
      };

      const search = new InstantSearch({
        indexName: '',
        searchClient: searchClientSpy,
      });

      expect(searchClientSpy.search).not.toHaveBeenCalled();

      search.start();

      expect(search.helper.state.query).toBe('');
      expect(searchClientSpy.search).toHaveBeenCalledTimes(1);
      expect(searchClientSpy.search.mock.calls[0][0]).toMatchSnapshot();
    });

    it('calls the provided searchFunction when used', () => {
      const searchFunctionSpy = jest.fn(h => {
        h.setQuery('test').search();
      });

      const searchClientSpy = {
        search: jest.fn(() => Promise.resolve({ results: [{}] })),
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
      expect(searchClientSpy.search.mock.calls[0][0]).toMatchSnapshot();
    });
  });
});
