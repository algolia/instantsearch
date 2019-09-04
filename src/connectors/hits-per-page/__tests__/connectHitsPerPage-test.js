import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import connectHitsPerPage from '../connectHitsPerPage';

describe('connectHitsPerPage', () => {
  describe('Usage', () => {
    it('throws without items', () => {
      expect(() => {
        connectHitsPerPage(() => {})({
          items: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`items\` option expects an array of objects.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/#connector"
`);
    });

    it('throws with empty items', () => {
      expect(() => {
        connectHitsPerPage(() => {})({
          items: [],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"A default value must be specified in \`items\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/#connector"
`);
    });

    it('throws without default item', () => {
      expect(() => {
        connectHitsPerPage(() => {})({
          items: [
            { value: 3, label: '3 items per page' },
            { value: 10, label: '10 items per page' },
          ],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"A default value must be specified in \`items\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/#connector"
`);
    });

    it('throws with multiple default items', () => {
      expect(() => {
        connectHitsPerPage(() => {})({
          items: [
            { value: 3, label: '3 items per page', default: true },
            { value: 10, label: '10 items per page', default: true },
          ],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"More than one default value is specified in \`items\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/#connector"
`);
    });

    it('does not throw with items and one default value', () => {
      expect(() => {
        connectHitsPerPage(() => {})({
          items: [
            { value: 3, label: '3 items per page', default: true },
            { value: 10, label: '10 items per page' },
          ],
        });
      }).not.toThrow();
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customHitsPerPage = connectHitsPerPage(render, unmount);
      const widget = customHitsPerPage({
        items: [{ label: '10 items per page', value: 10, default: true }],
      });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.hitsPerPage',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),

          getWidgetState: expect.any(Function),
          getWidgetSearchParameters: expect.any(Function),
        })
      );
    });
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page', default: true },
        { value: 10, label: '10 items per page' },
      ],
    });

    expect(
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        hitsPerPage: 3,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 3,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: {
          items: [
            { value: 3, label: '3 items per page', default: true },
            { value: 10, label: '10 items per page' },
          ],
        },
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: {
          items: [
            { value: 3, label: '3 items per page', default: true },
            { value: 10, label: '10 items per page' },
          ],
        },
      }),
      false
    );
  });

  it('Renders during init and render with transformed items', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page', default: true },
        { value: 10, label: '10 items per page' },
      ],
      transformItems: items =>
        items.map(item => ({ ...item, label: 'transformed' })),
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 3,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ label: 'transformed' }),
          expect.objectContaining({ label: 'transformed' }),
        ],
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
    });

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ label: 'transformed' }),
          expect.objectContaining({ label: 'transformed' }),
        ],
      }),
      false
    );
  });

  it('Configures the search with the default hitsPerPage provided', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page', default: true },
      ],
    });

    expect(
      widget.getWidgetSearchParameters(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        hitsPerPage: 10,
      })
    );
  });

  it('Overrides previous hitsPerPage', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page', default: true },
      ],
    });

    expect(
      widget.getWidgetSearchParameters(
        new SearchParameters({ hitsPerPage: 20 }),
        { uiState: {} }
      )
    ).toEqual(
      new SearchParameters({
        hitsPerPage: 10,
      })
    );
  });

  it('Provide a function to change the current hits per page, and provide the current value', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
        { value: 11, label: '11 items per page', default: true },
      ],
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 11,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderOptions = renderFn.mock.calls[0][0];
    const { refine } = firstRenderOptions;
    expect(helper.state.hitsPerPage).toBe(11);
    refine(3);
    expect(helper.state.hitsPerPage).toBe(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderOptions = renderFn.mock.calls[1][0];
    const { refine: renderSetValue } = secondRenderOptions;
    expect(helper.state.hitsPerPage).toBe(3);
    renderSetValue(10);
    expect(helper.state.hitsPerPage).toBe(10);

    expect(helper.search).toHaveBeenCalledTimes(2);
  });

  it('provides a createURL function', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
        { value: 20, label: '20 items per page', default: true },
      ],
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 20,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: state => state,
    });

    const createURLAtInit = renderFn.mock.calls[0][0].createURL;
    expect(helper.state.hitsPerPage).toEqual(20);
    const URLStateAtInit = createURLAtInit(3);
    expect(URLStateAtInit.hitsPerPage).toEqual(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      createURL: state => state,
    });

    const createURLAtRender = renderFn.mock.calls[1][0].createURL;
    const URLStateAtRender = createURLAtRender(5);
    expect(URLStateAtRender.hitsPerPage).toEqual(5);
  });

  it('provides the current hitsPerPage value', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page' },
        { value: 10, label: '10 items per page' },
        { value: 7, label: '7 items per page', default: true },
      ],
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toMatchInlineSnapshot(`
      Array [
        Object {
          "isRefined": false,
          "label": "3 items per page",
          "value": 3,
        },
        Object {
          "isRefined": false,
          "label": "10 items per page",
          "value": 10,
        },
        Object {
          "default": true,
          "isRefined": true,
          "label": "7 items per page",
          "value": 7,
        },
      ]
    `);
    firstRenderOptions.refine(3);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.items).toMatchInlineSnapshot(`
      Array [
        Object {
          "isRefined": true,
          "label": "3 items per page",
          "value": 3,
        },
        Object {
          "isRefined": false,
          "label": "10 items per page",
          "value": 10,
        },
        Object {
          "default": true,
          "isRefined": false,
          "label": "7 items per page",
          "value": 7,
        },
      ]
    `);
  });

  it('adds an option for the unselecting values, when the current hitsPerPage is defined elsewhere', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page', default: true },
        { value: 10, label: '10 items per page' },
      ],
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toHaveLength(3);
    firstRenderOptions.refine(firstRenderOptions.items[0].value);
    expect(helper.state.hitsPerPage).toBeUndefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.items).toHaveLength(3);
    secondRenderOptions.refine(secondRenderOptions.items[0].value);
    expect(helper.state.hitsPerPage).toBeUndefined();
  });

  it('the option for unselecting values should work even if stringified', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page', default: true },
        { value: 10, label: '10 items per page' },
      ],
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toHaveLength(3);
    firstRenderOptions.refine(`${firstRenderOptions.items[0].value}`);
    expect(helper.state.hitsPerPage).toBeUndefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.items).toHaveLength(3);
    secondRenderOptions.refine(`${secondRenderOptions.items[0].value}`);
    expect(helper.state.hitsPerPage).toBeUndefined();
  });

  it('Should be able to unselect using an empty string', () => {
    const renderFn = jest.fn();
    const makeWidget = connectHitsPerPage(renderFn);
    const widget = makeWidget({
      items: [
        { value: 3, label: '3 items per page', default: true },
        { value: 10, label: '10 items per page' },
      ],
    });

    const helper = algoliasearchHelper({}, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toHaveLength(3);
    firstRenderOptions.refine('');
    expect(helper.state.hitsPerPage).toBeUndefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.items).toHaveLength(3);
    secondRenderOptions.refine('');
    expect(helper.state.hitsPerPage).toBeUndefined();
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectHitsPerPage(renderFn, unmountFn);
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 10, label: '10 items per page' },
        ],
      });

      expect(unmountFn).toHaveBeenCalledTimes(0);

      widget.dispose({ helper, state: helper.state });

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const helper = algoliasearchHelper({}, '');

      const renderFn = () => {};
      const makeWidget = connectHitsPerPage(renderFn);
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 10, label: '10 items per page' },
        ],
      });

      expect(() =>
        widget.dispose({ helper, state: helper.state })
      ).not.toThrow();
    });

    it('removes `hitsPerPage` from the `SearchParameters`', () => {
      const helper = algoliasearchHelper({}, '', {
        hitsPerPage: 5,
      });

      const renderFn = () => {};
      const unmountFn = jest.fn();
      const makeWidget = connectHitsPerPage(renderFn, unmountFn);
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 10, label: '10 items per page' },
        ],
      });

      expect(helper.state.hitsPerPage).toBe(5);

      const nextState = widget.dispose({ helper, state: helper.state });

      expect(nextState.hitsPerPage).toBeUndefined();
    });
  });

  describe('getWidgetState', () => {
    test('returns the `uiState` empty', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const helper = algoliasearchHelper({}, 'indexName');
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` empty with default value selected', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const helper = algoliasearchHelper({}, 'indexName', {
        hitsPerPage: 3,
      });

      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const helper = algoliasearchHelper({}, 'indexName', {
        hitsPerPage: '22',
      });
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
        }
      );

      expect(actual).toEqual({
        hitsPerPage: 22,
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the default value', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const helper = algoliasearchHelper({}, 'indexName');
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual.hitsPerPage).toEqual(3);
    });

    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const helper = algoliasearchHelper({}, 'indexName');
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          hitsPerPage: 22,
        },
      });

      expect(actual.hitsPerPage).toEqual(22);
    });

    test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const helper = algoliasearchHelper({}, 'indexName', {
        hitsPerPage: 22,
      });
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          hitsPerPage: 33,
        },
      });

      expect(actual.hitsPerPage).toEqual(33);
    });
  });
});
