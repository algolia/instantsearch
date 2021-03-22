import createInfiniteHitsSessionStorageCache from '../sessionStorage';

const KEY = 'ais.infiniteHits';

describe('createInfiniteHitsSessionStorageCache', () => {
  const originalSessionStorage = window.sessionStorage;
  // @ts-expect-error
  delete window.sessionStorage;

  let store = {};
  const getItem = jest.fn(key => store[key]);
  const setItem = jest.fn((key, value) => {
    store[key] = value;
  });
  const removeItem = jest.fn(key => delete store[key]);
  const defaultHits = [
    { objectID: 'a', __position: 0 },
    { objectID: 'b', __position: 1 },
    { objectID: 'c', __position: 2 },
  ];

  beforeAll(() => {
    Object.defineProperty(window, 'sessionStorage', {
      value: {
        getItem,
        setItem,
        removeItem,
      },
    });
  });

  beforeEach(() => {
    store = {};
  });

  afterEach(() => {
    getItem.mockClear();
    setItem.mockClear();
    removeItem.mockClear();
  });

  afterAll(() => {
    // @ts-expect-error
    window.sessionStorage = originalSessionStorage;
  });

  it('returns null initially', () => {
    const cache = createInfiniteHitsSessionStorageCache();
    expect(cache.read({ state: {} })).toBeNull();
  });

  it('returns what it was assigned before', () => {
    const cache = createInfiniteHitsSessionStorageCache();
    const state = { query: 'hello' };
    const hits = {
      1: defaultHits,
    };
    cache.write({ state, hits });
    expect(cache.read({ state })).toEqual(hits);
  });

  it('returns null if the state is different', () => {
    const cache = createInfiniteHitsSessionStorageCache();
    const state = { query: 'hello' };
    const newState = { query: 'world' };
    const hits = { 1: defaultHits };
    cache.write({ state, hits });
    expect(cache.read({ state: newState })).toBeNull();
  });

  it('clears cache if fails to read', () => {
    getItem.mockImplementation(() => '{invalid_json}');
    const cache = createInfiniteHitsSessionStorageCache();
    cache.read({ state: {} });
    expect(removeItem).toHaveBeenCalledTimes(1);
    expect(removeItem).toHaveBeenCalledWith(KEY);
  });

  it('returns null if sessionStorage.getItem() throws', () => {
    getItem.mockImplementation(() => {
      throw new Error();
    });
    const cache = createInfiniteHitsSessionStorageCache();
    expect(cache.read({ state: {} })).toBeNull();
  });

  it('does nothing if sessionStorage.setItem() throws', () => {
    setItem.mockImplementation(() => {
      throw new Error();
    });
    const cache = createInfiniteHitsSessionStorageCache();
    expect(() => {
      cache.write({ state: {}, hits: [] });
    }).not.toThrow();
  });
});
