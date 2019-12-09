import algoliasearchHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import connectAutocomplete from '../connectAutocomplete';
import { TAG_PLACEHOLDER } from '../../../lib/escape-highlight';
import { Client } from 'algoliasearch/lite';

describe('connectAutocomplete', () => {
  const getInitializedWidget = (config = {}) => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({
      ...config,
    });

    const initialConfig = {};
    const helper = algoliasearchHelper({} as Client, '', initialConfig);
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const { refine } = renderFn.mock.calls[0][0];

    return [widget, helper, refine];
  };

  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore
      connectAutocomplete();
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/autocomplete/js/#connector"
`);
  });

  it('warns when using the outdated `indices` option', () => {
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);

    const trigger = () => {
      makeWidget({
        // @ts-ignore outdated `indices` option
        indices: [
          { label: 'Products', value: 'products' },
          { label: 'Services', value: 'services' },
        ],
      });
    };

    expect(trigger)
      .toWarnDev(`[InstantSearch.js]: The option \`indices\` has been removed from the Autocomplete connector.

The indices to target are now inferred from the widgets tree.

An alternative would be:

const autocomplete = connectAutocomplete(renderer);

search.addWidgets([
  index({ indexName: 'products' }),
  index({ indexName: 'services' }),
  autocomplete()
]);`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customAutocomplete = connectAutocomplete(render, unmount);
    const widget = customAutocomplete({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.autocomplete',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('renders during init and render', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({});

    expect(render).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    expect(render).toHaveBeenCalledTimes(1);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: '',
        indices: [],
        refine: expect.any(Function),
        instantSearchInstance: expect.any(Object),
        widgetParams: expect.any(Object),
      }),
      true
    );

    widget.render!(createRenderOptions());

    expect(render).toHaveBeenCalledTimes(2);
    expect(render).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: '',
        indices: expect.any(Array),
        refine: expect.any(Function),
        instantSearchInstance: expect.any(Object),
        widgetParams: expect.any(Object),
      }),
      false
    );
  });

  it('consumes the correct indices', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({ escapeHTML: false });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    expect(render).toHaveBeenCalledTimes(1);

    const firstRenderOptions = render.mock.calls[0][0];

    expect(firstRenderOptions.indices).toHaveLength(0);

    const firstIndexHits = [{ name: 'Hit 1' }];
    const secondIndexHits = [{ name: 'Hit 1' }, { name: 'Hit 2' }];
    const scopedResults = [
      {
        indexId: 'indexId0',
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            index: 'indexName0',
            hits: firstIndexHits,
          }),
        ]),
        helper,
      },
      {
        indexId: 'indexId1',
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            index: 'indexName1',
            hits: secondIndexHits,
          }),
        ]),
        helper,
      },
    ];

    widget.render!(createRenderOptions({ helper, scopedResults }));

    const secondRenderOptions = render.mock.calls[1][0];

    expect(render).toHaveBeenCalledTimes(2);
    expect(secondRenderOptions.indices).toHaveLength(2);
    expect(secondRenderOptions.indices[0].indexId).toEqual('indexId0');
    expect(secondRenderOptions.indices[0].indexName).toEqual('indexName0');
    expect(secondRenderOptions.indices[0].hits).toEqual(firstIndexHits);
    expect(secondRenderOptions.indices[0].results.index).toEqual('indexName0');
    expect(secondRenderOptions.indices[0].results.hits).toEqual(firstIndexHits);
    expect(secondRenderOptions.indices[1].indexId).toEqual('indexId1');
    expect(secondRenderOptions.indices[1].indexName).toEqual('indexName1');
    expect(secondRenderOptions.indices[1].hits).toEqual(secondIndexHits);
    expect(secondRenderOptions.indices[1].results.index).toEqual('indexName1');
    expect(secondRenderOptions.indices[1].results.hits).toEqual(
      secondIndexHits
    );
  });

  it('sets a query and triggers search on `refine`', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    const { refine } = render.mock.calls[0][0];
    refine('foo');

    expect(helper.search).toHaveBeenCalledTimes(1);
    expect(helper.state.query).toBe('foo');
  });

  it('with escapeHTML should escape the hits and the results', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
      },
    ];

    const escapedHits = [
      {
        _highlightResult: {
          foobar: {
            value: '&lt;script&gt;<mark>foobar</mark>&lt;/script&gt;',
          },
        },
      },
    ];

    (escapedHits as any).__escaped = true;

    widget.init!(createInitOptions({ helper }));

    widget.render!(
      createRenderOptions({
        scopedResults: [
          {
            indexId: 'index0',
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({ hits }),
            ]),
            helper,
          },
        ],
        state: helper.state,
        helper,
      })
    );

    const rendering = render.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(escapedHits);
    expect(rendering.indices[0].results.hits).toEqual(escapedHits);
  });

  it('without escapeHTML should not escape the hits', () => {
    const searchClient = createSearchClient();
    const render = jest.fn();
    const makeWidget = connectAutocomplete(render);
    const widget = makeWidget({ escapeHTML: false });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${TAG_PLACEHOLDER.highlightPostTag}</script>`,
          },
        },
      },
    ];

    widget.init!(createInitOptions({ helper }));

    widget.render!(
      createRenderOptions({
        scopedResults: [
          {
            indexId: 'index0',
            results: new SearchResults(helper.state, [
              createSingleSearchResponse({ hits }),
            ]),
            helper,
          },
        ],
        state: helper.state,
        helper,
      })
    );

    const rendering = render.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(hits);
    expect(rendering.indices[0].results.hits).toEqual(hits);
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '');

      const render = jest.fn();
      const unmount = jest.fn();
      const makeWidget = connectAutocomplete(render, unmount);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(unmount).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmount).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '');

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
        query: 'Apple',
      });

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(helper.state.query).toBe('Apple');

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.query).toBeUndefined();
    });

    it('removes the TAG_PLACEHOLDER from the `SearchParameters`', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
        ...TAG_PLACEHOLDER,
      });

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({});

      expect(helper.state.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(helper.state.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );

      widget.init!(createInitOptions({ helper }));

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.highlightPreTag).toBeUndefined();
      expect(nextState.highlightPostTag).toBeUndefined();
    });

    it('does not remove the TAG_PLACEHOLDER from the `SearchParameters` with `escapeHTML` disabled', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const render = jest.fn();
      const makeWidget = connectAutocomplete(render);
      const widget = makeWidget({
        escapeHTML: false,
      });

      expect(helper.state.highlightPreTag).toBe('<mark>');
      expect(helper.state.highlightPostTag).toBe('</mark>');

      widget.init!(createInitOptions({ helper }));

      const nextState = widget.dispose!(
        createDisposeOptions({ helper, state: helper.state })
      ) as SearchParameters;

      expect(nextState.highlightPreTag).toBe('<mark>');
      expect(nextState.highlightPostTag).toBe('</mark>');
    });
  });

  describe('getWidgetState', () => {
    test('should give back the object unmodified if the default value is selected', () => {
      const [widget, helper] = getInitializedWidget();
      const uiStateBefore = {};
      const uiStateAfter = widget.getWidgetState(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });

    test('should add an entry equal to the refinement', () => {
      const [widget, helper, refine] = getInitializedWidget();
      refine('some query');
      const uiStateBefore = {};
      const uiStateAfter = widget.getWidgetState(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toEqual({
        query: 'some query',
      });
    });

    test('should give back the same instance if the value is already in the uiState', () => {
      const [widget, helper, refine] = getInitializedWidget();
      refine('query');
      const uiStateBefore = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );
      const uiStateAfter = widget.getWidgetState(uiStateBefore, {
        searchParameters: helper.state,
        helper,
      });
      expect(uiStateAfter).toBe(uiStateBefore);
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const [widget, helper] = getInitializedWidget();

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          query: 'Apple',
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: 'Apple',
          ...TAG_PLACEHOLDER,
        })
      );
    });

    test('returns the `SearchParameters` with the default value', () => {
      const [widget, helper] = getInitializedWidget();

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
          ...TAG_PLACEHOLDER,
        })
      );
    });

    test('does not add highlight tags if escapeHTML is false', () => {
      const [widget, helper] = getInitializedWidget({
        escapeHTML: false,
      });

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
        })
      );

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
        })
      );
    });

    test('overrides query from search parameters', () => {
      const [widget, helper] = getInitializedWidget();

      helper.setQuery('Zeppelin manufacturer');

      expect(helper.state).toEqual(
        new SearchParameters({
          index: '',
          query: 'Zeppelin manufacturer',
        })
      );

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          query: '',
          ...TAG_PLACEHOLDER,
        })
      );
    });
  });
});
