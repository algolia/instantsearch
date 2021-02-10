import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import connectSmartSort from '../connectSmartSort';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';
import { noop } from '../../../lib/utils';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { runAllMicroTasks } from '../../../../test/utils/runAllMicroTasks';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

const createHelper = () => {
  return algoliasearchHelper(createSearchClient(), '', {});
};

describe('connectSmartSort', () => {
  describe('Usage', () => {
    it('throws with relevancyStrictness out of bound', () => {
      // @ts-ignore wrong options
      expect(() => connectSmartSort()({ relevancyStrictness: -1 }))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`relevancyStrictness\` option must be between 0 and 100.

See documentation: https://www.algolia.com/doc/api-reference/widgets/smartSort/js/#connector"
`);

      // @ts-ignore wrong options
      expect(() => connectSmartSort()({ relevancyStrictness: 101 }))
        .toThrowErrorMatchingInlineSnapshot(`
"The \`relevancyStrictness\` option must be between 0 and 100.

See documentation: https://www.algolia.com/doc/api-reference/widgets/smartSort/js/#connector"
`);
    });

    it('does not throw when relevancyStrictness is not given', () => {
      expect(() => connectSmartSort(() => null)({})).not.toThrow();
    });
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customSmartSort = connectSmartSort(render, unmount);
    const widget = customSmartSort({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.smartSort',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('apply relevancyStrictness to searchParameter', () => {
    const helper = createHelper();
    const makeWidget = connectSmartSort(noop);
    const widget = makeWidget({
      relevancyStrictness: 10,
    });
    widget.init!(createInitOptions({ helper }));
    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        relevancyStrictness: 10,
      })
    );
  });

  it('dispose only the state set by smartSort', () => {
    const helper = createHelper();
    const makeWidget = connectSmartSort(noop);
    const widget = makeWidget({
      relevancyStrictness: 10,
    });
    helper.setState(
      widget.getWidgetSearchParameters!(
        new SearchParameters({
          relevancyStrictness: 10,
        }),
        { uiState: { smartSort: { relevancyStrictness: 10 } } }
      )
    );
    widget.init!(createInitOptions({ helper }));

    expect(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: {},
      })
    ).toEqual(
      new SearchParameters({
        relevancyStrictness: 10,
      })
    );

    const nextState = widget.dispose!(
      createDisposeOptions({ state: helper.state })
    );
    expect(nextState).toEqual(new SearchParameters({}));
  });

  it('apply relevancyStrictness to helper on refine()', () => {
    const helper = createHelper();
    const makeWidget = connectSmartSort(noop);
    const widget = makeWidget({});

    helper.setState(
      widget.getWidgetSearchParameters!(new SearchParameters({}), {
        uiState: { smartSort: { relevancyStrictness: 10 } },
      })
    );

    widget.init!(createInitOptions({ helper }));
    expect(helper.state.relevancyStrictness).toEqual(10);
    const renderState = widget.getWidgetRenderState(
      createRenderOptions({ helper })
    );

    renderState.refine(0);
    expect(helper.state.relevancyStrictness).toEqual(0);

    renderState.refine(11);
    expect(helper.state.relevancyStrictness).toEqual(11);
  });

  it('decide isSmartSorted based on appliedRelevancyStrictness', async () => {
    const helper = createHelper();
    const makeWidget = connectSmartSort(noop);
    const widget = makeWidget({});

    widget.init!(createInitOptions({ helper }));
    helper.search();

    await runAllMicroTasks();

    let renderState = widget.getWidgetRenderState(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            appliedRelevancyStrictness: 60,
          }),
        ]),
      })
    );
    expect(renderState.isSmartSorted).toBe(true);

    renderState.refine(0);
    renderState = widget.getWidgetRenderState(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            appliedRelevancyStrictness: 0,
          }),
        ]),
      })
    );
    expect(renderState.isSmartSorted).toBe(false);
  });

  describe('getRenderState', () => {
    it('return the render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const makeWidget = connectSmartSort(renderFn, unmountFn);
      const widget = makeWidget({
        relevancyStrictness: 15,
      });

      const renderState1 = widget.getRenderState({}, createInitOptions());
      expect(renderState1.smartSort).toEqual({
        isSmartSorted: false,
        refine: expect.any(Function),
        widgetParams: {
          relevancyStrictness: 15,
        },
      });

      widget.init!(createInitOptions());
      const renderState2 = widget.getRenderState({}, createRenderOptions());
      expect(renderState2.smartSort).toEqual({
        isSmartSorted: false,
        refine: expect.any(Function),
        widgetParams: {
          relevancyStrictness: 15,
        },
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('return the render state', () => {
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 15,
      });

      const widgetRenderState1 = widget.getWidgetRenderState(
        createInitOptions()
      );
      expect(widgetRenderState1).toEqual({
        isSmartSorted: false,
        refine: expect.any(Function),
        widgetParams: {
          relevancyStrictness: 15,
        },
      });

      widget.init!(createInitOptions());
      const widgetRenderState2 = widget.getWidgetRenderState(
        createRenderOptions()
      );
      expect(widgetRenderState2).toEqual({
        isSmartSorted: false,
        refine: expect.any(Function),
        widgetParams: {
          relevancyStrictness: 15,
        },
      });
    });
  });

  describe('getWidgetUiState', () => {
    it('add default parameters', () => {
      const helper = createHelper();
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 20,
      });

      expect(
        widget.getWidgetUiState!({}, { helper, searchParameters: helper.state })
      ).toEqual({
        smartSort: { relevancyStrictness: 20 },
      });
    });

    it('add refined parameters', () => {
      const helper = createHelper();
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 20,
      });

      widget.init!(createInitOptions({ helper }));
      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(25);

      expect(
        widget.getWidgetUiState!({}, { helper, searchParameters: helper.state })
      ).toEqual({
        smartSort: { relevancyStrictness: 25 },
      });
    });

    it('overwrite existing uiState with searchParameters', () => {
      const helper = createHelper();
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 20,
      });

      // applies 20 from widgetParams
      expect(
        widget.getWidgetUiState!(
          { smartSort: { relevancyStrictness: 25 } },
          { helper, searchParameters: helper.state }
        )
      ).toEqual({
        smartSort: { relevancyStrictness: 20 },
      });

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(30);

      // applies 30 from searchParameters
      expect(
        widget.getWidgetUiState!(
          { smartSort: { relevancyStrictness: 25 } },
          { helper, searchParameters: helper.state }
        )
      ).toEqual({
        smartSort: { relevancyStrictness: 30 },
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('return parameters set by default', () => {
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 20,
      });

      const searchParameters = widget.getWidgetSearchParameters!(
        new SearchParameters(),
        {
          uiState: {},
        }
      );
      expect(searchParameters).toEqual(
        new SearchParameters({ relevancyStrictness: 20 })
      );
    });

    it('return parameters set by uiState', () => {
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({});

      const searchParameters = widget.getWidgetSearchParameters!(
        new SearchParameters(),
        {
          uiState: {
            smartSort: {
              relevancyStrictness: 15,
            },
          },
        }
      );
      expect(searchParameters).toEqual(
        new SearchParameters({ relevancyStrictness: 15 })
      );
    });

    it('override parameters with the value from uiState', () => {
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 20,
      });

      const searchParameters = widget.getWidgetSearchParameters!(
        new SearchParameters(),
        {
          uiState: {
            smartSort: {
              relevancyStrictness: 15,
            },
          },
        }
      );

      expect(searchParameters).toEqual(
        new SearchParameters({ relevancyStrictness: 15 })
      );
    });

    it('store refined state', () => {
      const helper = createHelper();
      const makeWidget = connectSmartSort(noop);
      const widget = makeWidget({
        relevancyStrictness: 20,
      });

      widget.init!(createInitOptions({ helper }));
      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(25);

      const searchParameters = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });

      expect(searchParameters.relevancyStrictness).toEqual(25);
    });
  });
});
