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

describe('connectAutocomplete', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-ignore
      connectAutocomplete();
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (got type \\"undefined\\").

See documentation: https://www.algolia.com/doc/api-reference/widgets/autocomplete/js/#connector"
`);
  });

  it('warns when using the outdated `indices` option', () => {
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);

    const trigger = () => {
      // @ts-ignore outdated `indices` option
      makeWidget({ indices: [{ label: 'foo', value: 'foo' }] });
    };

    expect(trigger).toWarnDev(
      '[InstantSearch.js]: Since InstantSearch.js 4, `connectAutocomplete` infers the indices from the tree of widgets.\nThe `indices` option is ignored.'
    );
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
        getConfiguration: expect.any(Function),
      })
    );
  });

  it('renders during init and render', () => {
    const searchClient = createSearchClient();
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({});

    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: '',
        indices: [],
        refine: expect.any(Function),
      }),
      true
    );

    widget.render!(createRenderOptions());

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        currentRefinement: '',
        indices: expect.any(Array),
        refine: expect.any(Function),
      }),
      false
    );
  });

  it('consumes the correct indices', () => {
    const searchClient = createSearchClient();
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ escapeHTML: false });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    expect(renderFn).toHaveBeenCalledTimes(1);

    const firstRenderOptions = renderFn.mock.calls[0][0];

    expect(firstRenderOptions.indices).toHaveLength(0);

    const firstIndexHits = [{ name: 'Hit 1' }];
    const secondIndexHits = [{ name: 'Hit 1' }, { name: 'Hit 2' }];
    const scopedResults = [
      {
        indexId: 'index0',
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            index: 'index0',
            hits: firstIndexHits,
          }),
        ]),
      },
      {
        indexId: 'index1',
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            index: 'index1',
            hits: secondIndexHits,
          }),
        ]),
      },
    ];

    widget.render!(createRenderOptions({ helper, scopedResults }));

    const secondRenderOptions = renderFn.mock.calls[1][0];

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(secondRenderOptions.indices).toHaveLength(2);
    expect(secondRenderOptions.indices[0].index).toEqual('index0');
    expect(secondRenderOptions.indices[0].hits).toEqual(firstIndexHits);
    expect(secondRenderOptions.indices[0].results.index).toEqual('index0');
    expect(secondRenderOptions.indices[0].results.hits).toEqual(firstIndexHits);
    expect(secondRenderOptions.indices[1].index).toEqual('index1');
    expect(secondRenderOptions.indices[1].hits).toEqual(secondIndexHits);
    expect(secondRenderOptions.indices[1].results.index).toEqual('index1');
    expect(secondRenderOptions.indices[1].results.hits).toEqual(
      secondIndexHits
    );
  });

  it('sets a query and triggers search on `refine`', () => {
    const searchClient = createSearchClient();
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({});

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({ helper }));

    const { refine } = renderFn.mock.calls[0][0];
    refine('foo');

    expect(helper.search).toHaveBeenCalledTimes(1);
    expect(helper.state.query).toBe('foo');
  });

  it('with escapeHTML should escape the hits and the results', () => {
    const searchClient = createSearchClient();
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ escapeHTML: true });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${
              TAG_PLACEHOLDER.highlightPostTag
            }</script>`,
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
          },
        ],
        state: helper.state,
        helper,
      })
    );

    const rendering = renderFn.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(escapedHits);
    expect(rendering.indices[0].results.hits).toEqual(escapedHits);
  });

  it('without escapeHTML should not escape the hits', () => {
    const searchClient = createSearchClient();
    const renderFn = jest.fn();
    const makeWidget = connectAutocomplete(renderFn);
    const widget = makeWidget({ escapeHTML: false });

    const helper = algoliasearchHelper(searchClient, '', {});
    helper.search = jest.fn();

    const hits = [
      {
        _highlightResult: {
          foobar: {
            value: `<script>${TAG_PLACEHOLDER.highlightPreTag}foobar${
              TAG_PLACEHOLDER.highlightPostTag
            }</script>`,
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
          },
        ],
        state: helper.state,
        helper,
      })
    );

    const rendering = renderFn.mock.calls[1][0];

    expect(rendering.indices[0].hits).toEqual(hits);
    expect(rendering.indices[0].results.hits).toEqual(hits);
  });

  describe('getConfiguration', () => {
    it('adds a `query` to the `SearchParameters`', () => {
      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({});

      const nextConfiguation = widget.getConfiguration!(new SearchParameters());

      expect(nextConfiguation.query).toBe('');
    });

    it('adds the TAG_PLACEHOLDER to the `SearchParameters`', () => {
      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({});

      const nextConfiguation = widget.getConfiguration!(new SearchParameters());

      expect(nextConfiguation.highlightPreTag).toBe(
        TAG_PLACEHOLDER.highlightPreTag
      );

      expect(nextConfiguation.highlightPostTag).toBe(
        TAG_PLACEHOLDER.highlightPostTag
      );
    });

    it('does not add the TAG_PLACEHOLDER to the `SearchParameters` with `escapeHTML` disabled', () => {
      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({
        escapeHTML: false,
      });

      const nextConfiguation = widget.getConfiguration!(new SearchParameters());

      expect(nextConfiguation.highlightPreTag).toBeUndefined();
      expect(nextConfiguation.highlightPostTag).toBeUndefined();
    });
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'firstIndex');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectAutocomplete(renderFn, unmountFn);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'firstIndex');

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes the `query` from the `SearchParameters`', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'firstIndex', {
        query: 'Apple',
      });

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
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
      const helper = algoliasearchHelper(searchClient, 'firstIndex', {
        ...TAG_PLACEHOLDER,
      });

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
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
      const helper = algoliasearchHelper(searchClient, 'firstIndex', {
        highlightPreTag: '<mark>',
        highlightPostTag: '</mark>',
      });

      const renderFn = () => {};
      const makeWidget = connectAutocomplete(renderFn);
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
});
