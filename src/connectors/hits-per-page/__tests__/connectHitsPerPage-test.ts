import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import { connectHitsPerPage } from '../..';
import { HitsPerPageConnectorParams } from '../connectHitsPerPage';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

describe('connectHitsPerPage', () => {
  describe('Usage', () => {
    it('throws without items', () => {
      expect(() => {
        connectHitsPerPage(() => {})({
          // @ts-ignore
          items: undefined,
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`items\` option expects an array of objects.

See documentation: https://www.algolia.com/doc/api-reference/widgets/hits-per-page/js/#connector"
`);
    });

    it('throws with empty items', () => {
      const options: HitsPerPageConnectorParams = {
        items: [],
      };

      expect(() => {
        connectHitsPerPage(() => {})(options);
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

          getWidgetUiState: expect.any(Function),
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
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        hitsPerPage: 3,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(0);

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 3,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 3,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        items: [
          expect.objectContaining({ label: 'transformed' }),
          expect.objectContaining({ label: 'transformed' }),
        ],
      }),
      true
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
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
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
      widget.getWidgetSearchParameters!(
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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 11,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    const { refine } = firstRenderOptions;
    expect(helper.state.hitsPerPage).toBe(11);
    refine(3);
    expect(helper.state.hitsPerPage).toBe(3);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 20,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
        createURL: state => JSON.stringify(state),
      })
    );

    const createURLAtInit = renderFn.mock.calls[0][0].createURL;
    expect(helper.state.hitsPerPage).toEqual(20);
    const URLStateAtInit = JSON.parse(createURLAtInit(3));
    expect(URLStateAtInit.hitsPerPage).toEqual(3);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        createURL: state => JSON.stringify(state),
      })
    );

    const createURLAtRender = renderFn.mock.calls[1][0].createURL;
    const URLStateAtRender = JSON.parse(createURLAtRender(5));
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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

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

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toHaveLength(3);
    firstRenderOptions.refine(firstRenderOptions.items[0].value);
    expect(helper.state.hitsPerPage).toBeUndefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toHaveLength(3);
    firstRenderOptions.refine(`${firstRenderOptions.items[0].value}`);
    expect(helper.state.hitsPerPage).toBeUndefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

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

    const searchClient = createSearchClient();
    const helper = algoliasearchHelper(searchClient, '', {
      hitsPerPage: 7,
    });
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    const firstRenderOptions = renderFn.mock.calls[0][0];
    expect(firstRenderOptions.items).toHaveLength(3);
    firstRenderOptions.refine('');
    expect(helper.state.hitsPerPage).toBeUndefined();

    // Reset the hitsPerPage to an actual value
    helper.setQueryParameter('hitsPerPage', 7);

    widget.render!(
      createRenderOptions({
        results: new SearchResults(helper.state, [
          createSingleSearchResponse(),
        ]),
        state: helper.state,
        helper,
      })
    );

    const secondRenderOptions = renderFn.mock.calls[1][0];
    expect(secondRenderOptions.items).toHaveLength(3);
    secondRenderOptions.refine('');
    expect(helper.state.hitsPerPage).toBeUndefined();
  });

  describe('dispose', () => {
    it('calls the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '');

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

      widget.dispose!(createDisposeOptions({ helper, state: helper.state }));

      expect(unmountFn).toHaveBeenCalledTimes(1);
    });

    it('does not throw without the unmount function', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '');

      const renderFn = () => {};
      const makeWidget = connectHitsPerPage(renderFn);
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 10, label: '10 items per page' },
        ],
      });

      expect(() =>
        widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
      ).not.toThrow();
    });

    it('removes `hitsPerPage` from the `SearchParameters`', () => {
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, '', {
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

      const nextState = widget.dispose!(
        createDisposeOptions({
          helper,
          state: helper.state,
        })
      ) as SearchParameters;

      expect(nextState.hitsPerPage).toBeUndefined();
    });
  });

  describe('getRenderState', () => {
    test('returns the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHitsPerPage = connectHitsPerPage(renderFn, unmountFn);
      const hitsPerPage = createHitsPerPage({
        items: [
          {
            label: '4',
            value: 4,
            default: true,
          },
          {
            label: '8',
            value: 8,
          },
        ],
      });
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const renderState1 = hitsPerPage.getRenderState(
        {
          hitsPerPage: {
            items: [
              {
                label: '4',
                value: 4,
                isRefined: false,
              },
              {
                label: '8',
                value: 8,
                isRefined: false,
              },
            ],
            createURL: expect.any(Function),
            refine: expect.any(Function),
            hasNoResults: false,
            widgetParams: {
              items: [
                {
                  label: '4',
                  value: 4,
                  default: true,
                },
                {
                  label: '8',
                  value: 8,
                },
              ],
            },
          },
        },
        createInitOptions({ helper })
      );

      expect(renderState1.hitsPerPage).toEqual({
        items: [
          {
            label: '4',
            value: 4,
            default: true,
            isRefined: false,
          },
          {
            label: '8',
            value: 8,
            isRefined: false,
          },
        ],
        createURL: expect.any(Function),
        hasNoResults: true,
        refine: expect.any(Function),
        widgetParams: {
          items: [
            {
              label: '4',
              value: 4,
              default: true,
            },
            {
              label: '8',
              value: 8,
            },
          ],
        },
      });

      hitsPerPage.init!(createInitOptions({ helper }));

      const renderState2 = hitsPerPage.getRenderState(
        {
          hitsPerPage: {
            items: [
              {
                label: '4',
                value: 4,
                isRefined: false,
              },
              {
                label: '8',
                value: 8,
                isRefined: false,
              },
            ],
            createURL: () => '',
            refine: () => {},
            hasNoResults: true,
            widgetParams: {
              items: [
                {
                  label: '4',
                  value: 4,
                  default: true,
                },
                {
                  label: '8',
                  value: 8,
                },
              ],
            },
          },
        },
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hitsPerPage: 4,
            }),
          ]),
        })
      );

      expect(renderState2.hitsPerPage).toEqual({
        items: [
          {
            label: '',
            value: '',
            isRefined: false,
          },
          {
            label: '4',
            value: 4,
            default: true,
            isRefined: false,
          },
          {
            label: '8',
            value: 8,
            isRefined: false,
          },
        ],
        createURL: expect.any(Function),
        hasNoResults: true,
        refine: expect.any(Function),
        widgetParams: {
          items: [
            {
              label: '4',
              value: 4,
              default: true,
            },
            {
              label: '8',
              value: 8,
            },
          ],
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createHitsPerPage = connectHitsPerPage(renderFn, unmountFn);
      const hitsPerPage = createHitsPerPage({
        items: [
          { label: '4', value: 4, default: true },
          { label: '8', value: 8 },
        ],
      });
      const helper = algoliasearchHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const renderState1 = hitsPerPage.getWidgetRenderState(
        createInitOptions({ helper })
      );

      expect(renderState1).toEqual({
        items: [
          {
            label: '4',
            value: 4,
            default: true,
            isRefined: false,
          },
          {
            label: '8',
            value: 8,
            isRefined: false,
          },
        ],
        refine: expect.any(Function),
        createURL: expect.any(Function),
        hasNoResults: true,
        widgetParams: {
          items: [
            {
              label: '4',
              value: 4,
              default: true,
            },
            {
              label: '8',
              value: 8,
            },
          ],
        },
      });

      hitsPerPage.init!(createInitOptions({ helper }));

      const renderState2 = hitsPerPage.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hitsPerPage: 4,
            }),
          ]),
        })
      );

      expect(renderState2).toEqual({
        items: [
          {
            label: '',
            value: '',
            isRefined: false,
          },
          {
            label: '4',
            value: 4,
            default: true,
            isRefined: false,
          },
          {
            label: '8',
            value: 8,
            isRefined: false,
          },
        ],
        createURL: expect.any(Function),
        hasNoResults: true,
        refine: expect.any(Function),
        widgetParams: {
          items: [
            {
              label: '4',
              value: 4,
              default: true,
            },
            {
              label: '8',
              value: 8,
            },
          ],
        },
      });
    });
  });

  describe('getWidgetUiState', () => {
    test('returns the `uiState` empty', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'indexName');
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` empty with default value selected', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'indexName', {
        hitsPerPage: 3,
      });

      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
        }
      );

      expect(actual).toEqual({});
    });

    test('returns the `uiState` with a refinement', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'indexName', {
        hitsPerPage: 22,
      });
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetUiState!(
        {},
        {
          searchParameters: helper.state,
          helper,
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
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'indexName');
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(actual.hitsPerPage).toEqual(3);
    });

    test('returns the `SearchParameters` with the value from `uiState`', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'indexName');
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          hitsPerPage: 22,
        },
      });

      expect(actual.hitsPerPage).toEqual(22);
    });

    test('returns the `SearchParameters` with the value from `uiState` without the previous refinement', () => {
      const render = jest.fn();
      const makeWidget = connectHitsPerPage(render);
      const searchClient = createSearchClient();
      const helper = algoliasearchHelper(searchClient, 'indexName', {
        hitsPerPage: 22,
      });
      const widget = makeWidget({
        items: [
          { value: 3, label: '3 items per page', default: true },
          { value: 22, label: '22 items per page' },
        ],
      });

      const actual = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {
          hitsPerPage: 33,
        },
      });

      expect(actual.hitsPerPage).toEqual(33);
    });
  });
});
