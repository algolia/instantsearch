import InstantSearch from '../InstantSearch';

describe('InstantSearch Search Client', () => {
  it('gets called on search', () => {
    const searchClientSpy = {
      search: jest.fn(),
    };

    const search = new InstantSearch({
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
      searchFunction: searchFunctionSpy,
      searchClient: searchClientSpy,
    });

    expect(searchFunctionSpy).not.toHaveBeenCalled();
    expect(searchClientSpy.search).not.toHaveBeenCalled();

    search.start();

    expect(searchFunctionSpy).toHaveBeenCalledTimes(1);
    expect(search.helper.state.query).toBe('test');
    expect(searchClientSpy.search).toHaveBeenCalledTimes(1);
  });
});
