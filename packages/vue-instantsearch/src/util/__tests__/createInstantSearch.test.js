import { createInstantSearch } from '../createInstantSearch';
import instantsearchFactory from 'instantsearch.js/es';
import { createSerializedState } from '../testutils/helper';

describe('createInstantSearch', () => {
  it('allows passing of more arguments to instantsearch', () => {
    createInstantSearch({
      searchClient: {},
      indexName: 'whatever',

      whatILike: ['this', 'self'],
    });

    expect(instantsearchFactory).toHaveBeenCalledWith({
      indexName: 'whatever',
      searchClient: {},
      whatILike: ['this', 'self'],
    });
  });
});

describe('rootMixin', () => {
  it('provides the search instance as $_ais', () => {
    const { rootMixin, instantsearch } = createInstantSearch({
      searchClient: {},
      indexName: 'bla',
    });
    expect(rootMixin.provide().$_ais).toBe(instantsearch);
  });
});

describe('findResultsState', () => {
  it('modifies the state of InstantSearch', async () => {
    const searchClient = {
      search: jest.fn(([{ query }]) =>
        Promise.resolve({ results: [{ query }] })
      ),
    };
    const { instantsearch } = createInstantSearch({
      searchClient,
      indexName: 'bla',
    });

    await instantsearch.findResultsState({
      query: 'hi there!',
    });

    expect(instantsearch.getState()).toEqual({
      lastResults: expect.objectContaining({
        _state: expect.objectContaining({
          query: 'hi there!',
          index: 'bla',
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
        }),
      }),
    });
  });

  it('can pass search parameters', async () => {
    const searchClient = {
      search: jest.fn(({ query }) => Promise.resolve({ results: [{ query }] })),
    };
    const { instantsearch } = createInstantSearch({
      searchClient,
      indexName: 'bla',
    });

    await instantsearch.findResultsState({
      query: 'hi there!',
      someRandomParameter: "it doesn't exist",
    });

    expect(searchClient.search).toHaveBeenCalledWith([
      expect.objectContaining({
        params: expect.objectContaining({
          query: 'hi there!',
          someRandomParameter: "it doesn't exist",
        }),
      }),
    ]);
  });

  it('always passes highlightPreTag or highlightPostTag', async () => {
    const searchClient = {
      search: jest.fn(([{ query }]) =>
        Promise.resolve({ results: [{ query }] })
      ),
    };
    const { instantsearch } = createInstantSearch({
      searchClient,
      indexName: 'bla',
    });

    await instantsearch.findResultsState({});

    expect(searchClient.search).toHaveBeenCalledWith([
      expect.objectContaining({
        params: expect.objectContaining({
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
        }),
      }),
    ]);
  });

  it('can not override highlightPreTag or highlightPostTag', async () => {
    const searchClient = {
      search: jest.fn(([{ query }]) =>
        Promise.resolve({ results: [{ query }] })
      ),
    };
    const { instantsearch } = createInstantSearch({
      searchClient,
      indexName: 'bla',
    });

    await instantsearch.findResultsState({
      highlightPreTag: '<em>',
      highlightPostTag: '</em>',
    });

    expect(searchClient.search).toHaveBeenCalledWith([
      expect.objectContaining({
        params: expect.objectContaining({
          highlightPostTag: '__/ais-highlight__',
          highlightPreTag: '__ais-highlight__',
        }),
      }),
    ]);
  });
});

describe('__forceRender', () => {
  const { instantsearch } = createInstantSearch({
    searchClient: {},
    indexName: 'bla',
  });

  instantsearch.helper.lastResults = { _state: {} };

  const widget = {
    init: jest.fn(),
    render: jest.fn(),
  };

  instantsearch.__forceRender(widget);

  const initArgs = widget.init.mock.calls[0][0];
  const renderArgs = widget.render.mock.calls[0][0];

  it('calls init & render on widget', () => {
    expect(widget.init).toHaveBeenCalledTimes(1);
    expect(widget.render).toHaveBeenCalledTimes(1);

    expect(initArgs).toMatchInlineSnapshot(
      {
        helper: expect.any(Object),
        instantSearchInstance: expect.any(Object),
      },
      `
Object {
  "createURL": [Function],
  "helper": Any<Object>,
  "instantSearchInstance": Any<Object>,
  "onHistoryChange": [Function],
  "state": Object {},
  "templatesConfig": Object {},
}
`
    );

    expect(renderArgs).toMatchInlineSnapshot(
      {
        helper: expect.any(Object),
        instantSearchInstance: expect.any(Object),
      },
      `
Object {
  "createURL": [Function],
  "helper": Any<Object>,
  "instantSearchInstance": Any<Object>,
  "results": Object {
    "_state": Object {},
  },
  "searchMetadata": Object {
    "isSearchStalled": false,
  },
  "state": Object {},
  "templatesConfig": Object {},
}
`
    );
  });

  it('returns a fake createURL to init & render', () => {
    // TODO: should take `routing` in account
    expect(initArgs.createURL()).toBe('#');
    expect(renderArgs.createURL()).toBe('#');
  });

  it('returns a fake onHistoryChange to init', () => {
    expect(initArgs.onHistoryChange()).toBe(undefined);
  });

  it('warns if the `search` has no helper', () => {
    // this happens if this method gets called without hydrate / findResultsState
    instantsearch.helper = null; // default value in InstantSearch
    global.console.warn = jest.fn();

    instantsearch.__forceRender(widget);

    expect(widget.init).toHaveBeenCalledTimes(1);
    expect(widget.render).toHaveBeenCalledTimes(1);
    expect(global.console.warn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"\`instantsearch.findResultsState()\` needs to be called when using \`ais-instant-search-ssr\`."`
    );
  });
});

describe('hydrate', () => {
  it('warns if called without arguments', () => {
    global.console.warn = jest.fn();
    const { instantsearch } = createInstantSearch({
      searchClient: {},
      indexName: 'bla',
    });

    instantsearch.hydrate();

    expect(global.console.warn.mock.calls[0][0]).toMatchInlineSnapshot(
      `"The result of \`getState()\` needs to be passed to \`hydrate()\`."`
    );
  });

  it('reads state from argument', () => {
    const { instantsearch } = createInstantSearch({
      searchClient: {},
      indexName: 'bla',
    });

    instantsearch.hydrate(createSerializedState());

    expect(instantsearch.searchParameters).toEqual(
      expect.objectContaining({
        query: 'hi',
      })
    );
  });
});

describe('getState', () => {
  it('will return undefined if called before findResultsState', () => {
    global.console.warn = jest.fn();
    const { instantsearch } = createInstantSearch({
      searchClient: {},
      indexName: 'test',
    });

    expect(instantsearch.getState()).toBe(undefined);
  });

  it('returns the last state', () => {
    const { instantsearch } = createInstantSearch({
      searchClient: {},
      indexName: 'test',
    });

    instantsearch.helper.lastResults = { dog: true };

    expect(instantsearch.getState()).toMatchInlineSnapshot(`
Object {
  "lastResults": Object {
    "dog": true,
  },
}
`);
  });
});
