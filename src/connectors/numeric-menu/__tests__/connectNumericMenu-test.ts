import jsHelper, {
  SearchResults,
  SearchParameters,
} from 'algoliasearch-helper';
import connectNumericMenu, {
  NumericMenuConnectorParamsItem,
  NumericMenuRenderState,
  NumericMenuRenderStateItem,
} from '../connectNumericMenu';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

const encodeValue = (
  start: NumericMenuConnectorParamsItem['start'],
  end?: NumericMenuConnectorParamsItem['end']
) => window.encodeURI(JSON.stringify({ start, end }));
const mapOptionsToItems: (
  item: NumericMenuConnectorParamsItem
) => NumericMenuRenderStateItem = ({ start, end, label }) => ({
  label,
  value: encodeValue(start, end),
  isRefined: false,
});

describe('connectNumericMenu', () => {
  const getInitializedWidget = () => {
    const rendering = jest.fn<any, [NumericMenuRenderState, boolean]>();
    const makeWidget = connectNumericMenu(rendering);
    const widget = makeWidget({
      attribute: 'numerics',
      items: [
        { label: 'below 10', end: 10 },
        { label: '10 - 20', start: 10, end: 20 },
        { label: 'more than 20', start: 20 },
      ],
    });

    const helper = jsHelper(createSearchClient(), '');
    helper.search = () => helper;

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const { refine } = rendering.mock.calls[0][0];

    return [widget, helper, refine] as const;
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        // @ts-ignore
        connectNumericMenu()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/numeric-menu/js/#connector"
`);
    });

    it('throws without attribute', () => {
      expect(() => {
        // @ts-ignore
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
          // @ts-ignore
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
          getWidgetUiState: expect.any(Function),
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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbHits: 0 }),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(rendering).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [expect.objectContaining({ label: 'transformed' })],
      }),
      expect.anything()
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({ nbHits: 0 }),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    let refine =
      rendering.mock.calls[rendering.mock.calls.length - 1][0].refine;

    listOptions.forEach((option, i) => {
      refine(encodeValue(option.start, option.end));

      widget.render!(
        createRenderOptions({
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
          state: helper.state,
          helper,
        })
      );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const refine =
      rendering.mock.calls[rendering.mock.calls.length - 1][0].refine;
    // a user selects a value in the refinement list
    refine(encodeValue(listOptions[0].start, listOptions[0].end));

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

    // No option should be selected
    const expectedResults0 = [...listOptions].map(mapOptionsToItems);
    expectedResults0[0].isRefined = true;

    const renderingParameters0 =
      rendering.mock.calls[rendering.mock.calls.length - 1][0];
    expect(renderingParameters0.items).toEqual(expectedResults0);

    // Only the current refinement is cleared by a third party
    helper.removeNumericRefinement('numerics', '<=', 10);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const refine =
      rendering.mock.calls[rendering.mock.calls.length - 1][0].refine;
    // a user selects a value in the refinement list
    refine(encodeValue(listOptions[0].start, listOptions[0].end));

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

    // No option should be selected
    const expectedResults0 = [...listOptions].map(mapOptionsToItems);
    expectedResults0[0].isRefined = true;

    const renderingParameters0 =
      rendering.mock.calls[rendering.mock.calls.length - 1][0];
    expect(renderingParameters0.items).toEqual(expectedResults0);

    // All the refinements are cleared by a third party
    helper.clearRefinements('numerics');

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderingOptions = rendering.mock.calls[0][0];
    expect(firstRenderingOptions.items[0].isRefined).toBe(false);

    // a user selects a value in the refinement list
    firstRenderingOptions.refine(
      encodeValue(listOptions[0].start, listOptions[0].end)
    );

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();
    helper.setPage(2);

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    const helper = jsHelper(createSearchClient(), '');

    expect(() =>
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
    ).not.toThrow();
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const [widget, helper] = getInitializedWidget();

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetUiState!(
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

      const actual = widget.getWidgetSearchParameters!(helper.state, {
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

  describe('insights', () => {
    it('sends event when a facet is added', () => {
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

      const helper = jsHelper(createSearchClient(), '');
      helper.search = jest.fn();
      const initOptions = createInitOptions({
        helper,
        state: helper.state,
      });
      const { instantSearchInstance } = initOptions;
      widget.init!(initOptions);

      const firstRenderingOptions = rendering.mock.calls[0][0];
      const { refine, items } = firstRenderingOptions;
      refine(items[0].value);
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        1
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'numerics',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['numerics<=10'],
          index: '',
        },
        widgetType: 'ais.numericMenu',
      });

      refine(items[1].value);
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledTimes(
        2
      );
      expect(instantSearchInstance.sendEventToInsights).toHaveBeenCalledWith({
        attribute: 'numerics',
        eventType: 'click',
        insightsMethod: 'clickedFilters',
        payload: {
          eventName: 'Filter Applied',
          filters: ['numerics<=20', 'numerics>=10'],
          index: '',
        },
        widgetType: 'ais.numericMenu',
      });
    });
  });

  describe('getRenderState', () => {
    it('returns the render state', () => {
      const [widget, helper] = getInitializedWidget();

      const renderState1 = widget.getRenderState(
        {},
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState1.numericMenu).toEqual({
        numerics: {
          createURL: expect.any(Function),
          hasNoResults: true,
          items: [
            {
              isRefined: false,
              label: 'below 10',
              value: '%7B%22end%22:10%7D',
            },
            {
              isRefined: false,
              label: '10 - 20',
              value: '%7B%22start%22:10,%22end%22:20%7D',
            },
            {
              isRefined: false,
              label: 'more than 20',
              value: '%7B%22start%22:20%7D',
            },
          ],
          refine: expect.any(Function),
          sendEvent: expect.any(Function),
          widgetParams: {
            attribute: 'numerics',
            items: [
              {
                end: 10,
                label: 'below 10',
              },
              {
                end: 20,
                label: '10 - 20',
                start: 10,
              },
              {
                label: 'more than 20',
                start: 20,
              },
            ],
          },
        },
      });

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse(),
      ]);

      const renderState2 = widget.getRenderState(
        {},
        createRenderOptions({
          helper,
          state: helper.state,
          results,
        })
      );

      expect(renderState2.numericMenu).toEqual({
        numerics: {
          createURL: expect.any(Function),
          refine: renderState1.numericMenu!.numerics.refine,
          sendEvent: renderState1.numericMenu!.numerics.sendEvent,
          hasNoResults: true,
          items: [
            {
              isRefined: false,
              label: 'below 10',
              value: '%7B%22end%22:10%7D',
            },
            {
              isRefined: false,
              label: '10 - 20',
              value: '%7B%22start%22:10,%22end%22:20%7D',
            },
            {
              isRefined: false,
              label: 'more than 20',
              value: '%7B%22start%22:20%7D',
            },
          ],
          widgetParams: {
            attribute: 'numerics',
            items: [
              {
                end: 10,
                label: 'below 10',
              },
              {
                end: 20,
                label: '10 - 20',
                start: 10,
              },
              {
                label: 'more than 20',
                start: 20,
              },
            ],
          },
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state before init', () => {
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

      const helper = jsHelper(createSearchClient(), '');

      const renderState = widget.getWidgetRenderState(
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState).toEqual({
        items: [
          {
            isRefined: false,
            label: 'below 10',
            value: '%7B%22end%22:10%7D',
          },
          {
            isRefined: false,
            label: '10 - 20',
            value: '%7B%22start%22:10,%22end%22:20%7D',
          },
          {
            isRefined: false,
            label: 'more than 20',
            value: '%7B%22start%22:20%7D',
          },
        ],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        hasNoResults: true,
        widgetParams: {
          attribute: 'numerics',
          items: [
            {
              end: 10,
              label: 'below 10',
            },
            {
              end: 20,
              label: '10 - 20',
              start: 10,
            },
            {
              label: 'more than 20',
              start: 20,
            },
          ],
        },
      });
    });

    it('returns the widget render state', () => {
      const [widget, helper] = getInitializedWidget();

      const renderState1 = widget.getWidgetRenderState(
        createInitOptions({ state: helper.state, helper })
      );

      expect(renderState1).toEqual({
        items: [
          {
            isRefined: false,
            label: 'below 10',
            value: '%7B%22end%22:10%7D',
          },
          {
            isRefined: false,
            label: '10 - 20',
            value: '%7B%22start%22:10,%22end%22:20%7D',
          },
          {
            isRefined: false,
            label: 'more than 20',
            value: '%7B%22start%22:20%7D',
          },
        ],
        createURL: expect.any(Function),
        refine: expect.any(Function),
        sendEvent: expect.any(Function),
        hasNoResults: true,
        widgetParams: {
          attribute: 'numerics',
          items: [
            {
              end: 10,
              label: 'below 10',
            },
            {
              end: 20,
              label: '10 - 20',
              start: 10,
            },
            {
              label: 'more than 20',
              start: 20,
            },
          ],
        },
      });

      const results = new SearchResults(helper.state, [
        createSingleSearchResponse({}),
      ]);

      const renderState2 = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results,
        })
      );

      expect(renderState2).toEqual({
        createURL: expect.any(Function),
        hasNoResults: true,
        items: [
          {
            isRefined: false,
            label: 'below 10',
            value: '%7B%22end%22:10%7D',
          },
          {
            isRefined: false,
            label: '10 - 20',
            value: '%7B%22start%22:10,%22end%22:20%7D',
          },
          {
            isRefined: false,
            label: 'more than 20',
            value: '%7B%22start%22:20%7D',
          },
        ],
        refine: renderState1.refine,
        sendEvent: renderState1.sendEvent,
        widgetParams: {
          attribute: 'numerics',
          items: [
            {
              end: 10,
              label: 'below 10',
            },
            {
              end: 20,
              label: '10 - 20',
              start: 10,
            },
            {
              label: 'more than 20',
              start: 20,
            },
          ],
        },
      });
    });
  });
});
