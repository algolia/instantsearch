import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectNumericMenu from '../connectNumericMenu';

const encodeValue = (start, end) =>
  window.encodeURI(JSON.stringify({ start, end }));
const mapOptionsToItems = ({ start, end, label }) => ({
  label,
  value: encodeValue(start, end),
  isRefined: false,
});

describe('connectNumericMenu', () => {
  const getInitializedWidget = () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
      ],
    });

    const helper = jsHelper({}, '');
    helper.search = () => {};

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const { refine } = rendering.mock.calls[0][0];

    return [widget, helper, refine];
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectNumericMenu()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/numeric-menu/js/#connector"
`);
    });

    it('throws without attribute', () => {
      expect(() => {
        connectNumericMenu(() => {})({ attribute: undefined, items: [] });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`attribute\` option is required.

See documentation: https://www.algolia.com/doc/api-reference/widgets/numeric-menu/js/#connector"
`);
    });

    it('throws without items', () => {
      expect(() => {
        connectNumericMenu(() => {})({
          attribute: 'attribute',
          items: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`items\` option expects an array of objects.

See documentation: https://www.algolia.com/doc/api-reference/widgets/numeric-menu/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customNumericMenu = connectNumericMenu(render, unmount);
      const widget = customNumericMenu({
        attribute: 'facet',
        items: [{ label: 'x', start: 0 }],
      });

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.numericMenu',
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
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
      ],
    });

    // test if widget is not rendered yet at this point
    expect(rendering).toHaveBeenCalledTimes(0);

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = true
    expect(rendering).toHaveBeenCalledTimes(1);
    // test if isFirstRendering is true during init
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: {
          attribute: 'numerics',
          items: [
            { label: 'below 10', end: 10 },
            { label: '10 - 20', start: 10, end: 20 },
            { label: 'more than 20', start: 20 },
          ],
        },
      }),
      true
    );

    widget.render({
      results: new SearchResults(helper.state, [{ nbHits: 0 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // test that rendering has been called during init with isFirstRendering = false
    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        widgetParams: {
          attribute: 'numerics',
          items: [
            { label: 'below 10', end: 10 },
            { label: '10 - 20', start: 10, end: 20 },
            { label: 'more than 20', start: 20 },
          ],
        },
      }),
      false
    );
  });

  it('Renders during init and render with transformed items', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const widget = makeWidget({
      attribute: 'numerics',
      items: [{ label: 'below 10', end: 10 }],
      transformItems: items =>
        items.map(item => ({
          ...item,
          label: 'transformed',
        })),
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ label: 'transformed' })],
      }),
      expect.anything()
    );

    widget.render({
      results: new SearchResults(helper.state, [{ nbHits: 0 }]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ label: 'transformed' })],
      }),
      expect.anything()
    );
  });

  it('Provide a function to update the refinements at each step', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
        { label: '42', start: 42, end: 42 },
        { label: 'void' },
      ],
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine, items } = firstRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({});
    refine(items[0].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [10],
    });
    refine(items[1].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '>=': [10],
      '<=': [20],
    });
    refine(items[2].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '>=': [20],
    });
    refine(items[3].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '=': [42],
      '>=': [],
    });
    refine(items[4].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '=': [],
      '>=': [],
    });

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    const {
      refine: renderToggleRefinement,
      items: renderFacetValues,
    } = secondRenderingOptions;
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '=': [],
      '>=': [],
    });
    renderToggleRefinement(renderFacetValues[0].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [10],
      '=': [],
      '>=': [],
    });
    renderToggleRefinement(renderFacetValues[1].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '>=': [10],
      '=': [],
      '<=': [20],
    });
    renderToggleRefinement(renderFacetValues[2].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '=': [],
      '>=': [20],
    });
    renderToggleRefinement(renderFacetValues[3].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '=': [42],
      '>=': [],
    });
    renderToggleRefinement(renderFacetValues[4].value);
    expect(helper.state.getNumericRefinements('numerics')).toEqual({
      '<=': [],
      '=': [],
      '>=': [],
    });
  });

  it('provides the correct facet values', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
      ],
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          {
            label: 'below 10',
            value: encodeValue(undefined, 10),
            isRefined: false,
          },
          { label: '10 - 20', value: encodeValue(10, 20), isRefined: false },
          { label: 'more than 20', value: encodeValue(20), isRefined: false },
        ],
      }),
      expect.anything()
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          {
            label: 'below 10',
            value: encodeValue(undefined, 10),
            isRefined: false,
          },
          { label: '10 - 20', value: encodeValue(10, 20), isRefined: false },
          { label: 'more than 20', value: encodeValue(20), isRefined: false },
        ],
      }),
      expect.anything()
    );
  });

  it('provides isRefined for the currently selected value', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const listOptions = [
      { label: 'below 10', end: 10 },
      { label: '10 - 20', start: 10, end: 20 },
      { label: 'more than 20', start: 20 },
      { label: '42', start: 42, end: 42 },
      { label: 'void' },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      items: listOptions,
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    let refine =
      rendering.mock.calls[rendering.mock.calls.length - 1][0].refine;

    listOptions.forEach((option, i) => {
      refine(encodeValue(option.start, option.end));

      widget.render({
        results: new SearchResults(helper.state, [{}]),
        state: helper.state,
        helper,
        createURL: () => '#',
      });

      // The current option should be the one selected
      // First we copy and set the default added values
      const expectedResults = [...listOptions].map(mapOptionsToItems);

      // Then we modify the isRefined value of the one that is supposed to be refined
      expectedResults[i].isRefined = true;

      const renderingParameters =
        rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(renderingParameters.items).toEqual(expectedResults);

      refine = renderingParameters.refine;
    });
  });

  it('when only the refinement is cleared, the "no value" value should be refined', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const listOptions = [
      { label: 'below 10', end: 10 },
      { label: '10 - 20', start: 10, end: 20 },
      { label: 'more than 20', start: 20 },
      { label: '42', start: 42, end: 42 },
      { label: 'void' },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      items: listOptions,
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const refine =
      rendering.mock.calls[rendering.mock.calls.length - 1][0].refine;
    // a user selects a value in the refinement list
    refine(encodeValue(listOptions[0].start, listOptions[0].end));

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // No option should be selected
    const expectedResults0 = [...listOptions].map(mapOptionsToItems);
    expectedResults0[0].isRefined = true;

    const renderingParameters0 =
      rendering.mock.calls[rendering.mock.calls.length - 1][0];
    expect(renderingParameters0.items).toEqual(expectedResults0);

    // Only the current refinement is cleared by a third party
    helper.removeNumericRefinement('numerics', '<=', 10);

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // No option should be selected
    const expectedResults1 = [...listOptions].map(mapOptionsToItems);
    expectedResults1[4].isRefined = true;

    const renderingParameters1 =
      rendering.mock.calls[rendering.mock.calls.length - 1][0];
    expect(renderingParameters1.items).toEqual(expectedResults1);
  });

  it('when all the refinements are cleared, the "no value" value should be refined', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const listOptions = [
      { label: 'below 10', end: 10 },
      { label: '10 - 20', start: 10, end: 20 },
      { label: 'more than 20', start: 20 },
      { label: '42', start: 42, end: 42 },
      { label: 'void' },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      items: listOptions,
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const refine =
      rendering.mock.calls[rendering.mock.calls.length - 1][0].refine;
    // a user selects a value in the refinement list
    refine(encodeValue(listOptions[0].start, listOptions[0].end));

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // No option should be selected
    const expectedResults0 = [...listOptions].map(mapOptionsToItems);
    expectedResults0[0].isRefined = true;

    const renderingParameters0 =
      rendering.mock.calls[rendering.mock.calls.length - 1][0];
    expect(renderingParameters0.items).toEqual(expectedResults0);

    // All the refinements are cleared by a third party
    helper.clearRefinements('numerics');

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    // No option should be selected
    const expectedResults1 = [...listOptions].map(mapOptionsToItems);
    expectedResults1[4].isRefined = true;

    const renderingParameters1 =
      rendering.mock.calls[rendering.mock.calls.length - 1][0];
    expect(renderingParameters1.items).toEqual(expectedResults1);
  });

  it('should set `isRefined: true` after calling `refine(item)`', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);
    const listOptions = [
      { label: 'below 10', end: 10 },
      { label: '10 - 20', start: 10, end: 20 },
      { label: 'more than 20', start: 20 },
      { label: '42', start: 42, end: 42 },
      { label: 'void' },
    ];
    const widget = makeWidget({
      attribute: 'numerics',
      items: listOptions,
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items[0].isRefined).toBe(false);

    // a user selects a value in the refinement list
    firstRenderingOptions.refine(
      encodeValue(listOptions[0].start, listOptions[0].end)
    );

    widget.render({
      results: new SearchResults(helper.state, [{}]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    const secondRenderingOptions = rendering.mock.calls[1][0];
    expect(secondRenderingOptions.items[0].isRefined).toBe(true);
  });

  it('should reset page to 0 on refine() when the page is defined', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);

    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
        { label: '42', start: 42, end: 42 },
        { label: 'void' },
      ],
    });

    const helper = jsHelper({});
    helper.search = jest.fn();
    helper.setPage(2);

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(helper.state.page).toBe(2);

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine, items } = firstRenderingOptions;

    refine(items[0].value);

    expect(helper.state.page).toBe(0);
  });

  it('should not reset page on refine() when the page is not defined', () => {
    const rendering = jest.fn();
    const makeWidget = connectNumericMenu(rendering);

    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
        { label: '42', start: 42, end: 42 },
        { label: 'void' },
      ],
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    expect(helper.state.page).toBeUndefined();

    const firstRenderingOptions = rendering.mock.calls[0][0];
    const { refine, items } = firstRenderingOptions;

    refine(items[0].value);

    expect(helper.state.page).toBeUndefined();
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectNumericMenu(rendering);

    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
        { label: '42', start: 42, end: 42 },
        { label: 'void' },
      ],
    });

    const helper = jsHelper({});

    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
  });

  describe('getWidgetState', () => {
    test('returns the `uiState` empty', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement (exact)', () => {
      const [widget, helper] = getInitializedWidget();

      helper.addNumericRefinement('numerics', '=', 20);

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        numericMenu: {
          numerics: '20',
        },
      });
    });

    test('returns the `uiState` with a refinement (only min)', () => {
      const [widget, helper] = getInitializedWidget();

      helper.addNumericRefinement('numerics', '>=', 10);

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        numericMenu: {
          numerics: '10:',
        },
      });
    });

    test('returns the `uiState` with a refinement (only max)', () => {
      const [widget, helper] = getInitializedWidget();

      helper.addNumericRefinement('numerics', '<=', 20);

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        numericMenu: {
          numerics: ':20',
        },
      });
    });

    test('returns the `uiState` with a refinement (range)', () => {
      const [widget, helper] = getInitializedWidget();

      helper.addNumericRefinement('numerics', '>=', 10);
      helper.addNumericRefinement('numerics', '<=', 20);

      const actual = widget.getWidgetState(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        numericMenu: {
          numerics: '10:20',
        },
      });
    });

    test('returns the `uiState` without namespace overridden', () => {
      const [widget, helper] = getInitializedWidget();

      helper.addNumericRefinement('numerics', '>=', 10);
      helper.addNumericRefinement('numerics', '<=', 20);

      const actual = widget.getWidgetState(
        {
          numericMenu: {
            numerics2: '27:36',
          },
        },
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({
        numericMenu: {
          numerics: '10:20',
          numerics2: '27:36',
        },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    test('returns the `SearchParameters` with the default value', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {},
          },
        })
      );
    });

    test('returns the `SearchParameters` with the default value without the previous refinement', () => {
      const [widget, helper] = getInitializedWidget();

      helper.addNumericRefinement('numerics', '=', [5, 10]);

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {},
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {},
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
      const [widget, helper] = getInitializedWidget();

      helper
        .addNumericRefinement('numerics', '>=', [10])
        .addNumericRefinement('numerics', '<=', [20]);

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          numericMenu: {
            numerics: '10',
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {
              '=': [10],
            },
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState` (only min)', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          numericMenu: {
            numerics: '10:',
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {
              '>=': [10],
            },
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState` (only max)', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          numericMenu: {
            numerics: ':20',
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {
              '<=': [20],
            },
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState` (range)', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          numericMenu: {
            numerics: '10:20',
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {
              '>=': [10],
              '<=': [20],
            },
          },
        })
      );
    });

    test('returns the `SearchParameters` with the value from `uiState` (exact)', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetSearchParameters(helper.state, {
        uiState: {
          numericMenu: {
            numerics: '10',
          },
        },
      });

      expect(actual).toEqual(
        new SearchParameters({
          index: '',
          numericRefinements: {
            numerics: {
              '=': [10],
            },
          },
        })
      );
    });
  });
});
