import algoliasearchHelper, {
  SearchParameters,
  SearchResults,
} from 'algoliasearch-helper';
import connectRelevantSort from '../connectRelevantSort';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from '../../../../test/mock/createWidget';
import { noop } from '../../../lib/utils';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';

const createHelper = () => {
  return algoliasearchHelper(createSearchClient(), '', {});
};

describe('connectRelevantSort', () => {
  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customRelevantSort = connectRelevantSort(render, unmount);
    const widget = customRelevantSort({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.relevantSort',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('dispose relevancyStrictness set by the widget', () => {
    const helper = createHelper();
    const makeWidget = connectRelevantSort(noop);
    const widget = makeWidget({});
    widget.init!(createInitOptions({ helper }));
    const { refine } = widget.getWidgetRenderState(
      createRenderOptions({
        helper,
      })
    );
    refine(10);
    expect(
      widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      }).relevancyStrictness
    ).toEqual(10);

    const nextState = widget.dispose!(
      createDisposeOptions({ state: helper.state })
    ) as SearchParameters;
    expect(nextState.relevancyStrictness).toBeUndefined();
  });

  it('apply relevancyStrictness to helper on refine()', () => {
    const helper = createHelper();
    const makeWidget = connectRelevantSort(noop);
    const widget = makeWidget({});

    widget.init!(createInitOptions({ helper }));
    const { refine } = widget.getWidgetRenderState(
      createRenderOptions({ helper })
    );

    expect(helper.state.relevancyStrictness).toBeUndefined();

    refine(0);
    expect(helper.state.relevancyStrictness).toEqual(0);

    refine(11);
    expect(helper.state.relevancyStrictness).toEqual(11);
  });

  it('decide isRelevantSorted based on appliedRelevancyStrictness', () => {
    const helper = createHelper();
    const makeWidget = connectRelevantSort(noop);
    const widget = makeWidget({});

    widget.init!(createInitOptions({ helper }));

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
    expect(renderState.isRelevantSorted).toBe(true);

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
    expect(renderState.isRelevantSorted).toBe(false);
  });

  it('decide isVirtualReplica based on appliedRelevancyStrictness', () => {
    const helper = createHelper();
    const makeWidget = connectRelevantSort(noop);
    const widget = makeWidget({});

    widget.init!(createInitOptions({ helper }));

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
    expect(renderState.isVirtualReplica).toBe(true);

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
    expect(renderState.isVirtualReplica).toBe(true);

    renderState = widget.getWidgetRenderState(
      createRenderOptions({
        helper,
        results: new SearchResults(helper.state, [
          createSingleSearchResponse({
            hits: [],
            appliedRelevancyStrictness: undefined,
          }),
        ]),
      })
    );
    expect(renderState.isVirtualReplica).toBe(false);
  });

  describe('getRenderState', () => {
    it('return the render state', () => {
      const helper = createHelper();
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const makeWidget = connectRelevantSort(renderFn, unmountFn);
      const widget = makeWidget({});

      const renderState1 = widget.getRenderState(
        {},
        createInitOptions({ helper })
      );
      expect(renderState1.relevantSort).toEqual({
        isRelevantSorted: false,
        isVirtualReplica: false,
        canRefine: false,
        refine: expect.any(Function),
        widgetParams: {},
      });

      widget.init!(createInitOptions());
      const renderState2 = widget.getRenderState(
        {},
        createRenderOptions({
          helper,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              appliedRelevancyStrictness: 15,
            }),
          ]),
        })
      );
      expect(renderState2.relevantSort).toEqual({
        isRelevantSorted: true,
        isVirtualReplica: true,
        canRefine: true,
        refine: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('getWidgetRenderState', () => {
    it('return the widget render state', () => {
      const helper = createHelper();
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      const widgetRenderState1 = widget.getWidgetRenderState(
        createInitOptions({ helper })
      );
      expect(widgetRenderState1).toEqual({
        isRelevantSorted: false,
        isVirtualReplica: false,
        canRefine: false,
        refine: expect.any(Function),
        widgetParams: {},
      });

      widget.init!(createInitOptions());
      const widgetRenderState2 = widget.getWidgetRenderState(
        createRenderOptions({
          helper,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [],
              appliedRelevancyStrictness: 20,
            }),
          ]),
        })
      );
      expect(widgetRenderState2).toEqual({
        isRelevantSorted: true,
        isVirtualReplica: true,
        canRefine: true,
        refine: expect.any(Function),
        widgetParams: {},
      });
    });
  });

  describe('getWidgetUiState', () => {
    it('does not have relevancyStrictness by default', () => {
      const helper = createHelper();
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      const widgetUiState = widget.getWidgetUiState!(
        {},
        { helper, searchParameters: helper.state }
      );
      expect(widgetUiState.relevantSort).toBeUndefined();
    });

    it('add refined parameters', () => {
      const helper = createHelper();
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      widget.init!(createInitOptions({ helper }));
      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(25);

      expect(
        widget.getWidgetUiState!({}, { helper, searchParameters: helper.state })
      ).toEqual({
        relevantSort: 25,
      });
    });

    it('overwrite existing uiState with searchParameters', () => {
      const helper = createHelper();
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      expect(
        widget.getWidgetUiState!(
          { relevantSort: 25 },
          { helper, searchParameters: helper.state }
        )
      ).toEqual({
        relevantSort: 25,
      });

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(30);

      // applies 30 from searchParameters
      expect(
        widget.getWidgetUiState!(
          { relevantSort: 25 },
          { helper, searchParameters: helper.state }
        )
      ).toEqual({
        relevantSort: 30,
      });
    });
  });

  describe('getWidgetSearchParameters', () => {
    it('does not include relevancyStrictness by default', () => {
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      const searchParameters = widget.getWidgetSearchParameters!(
        new SearchParameters(),
        {
          uiState: {},
        }
      );
      expect(searchParameters.relevancyStrictness).toBeUndefined();
    });

    it('return parameters set by uiState', () => {
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      const searchParameters = widget.getWidgetSearchParameters!(
        new SearchParameters(),
        {
          uiState: {
            relevantSort: 15,
          },
        }
      );
      expect(searchParameters).toEqual(
        new SearchParameters({ relevancyStrictness: 15 })
      );
    });

    it('store refined state', () => {
      const helper = createHelper();
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(25);

      const searchParameters = widget.getWidgetSearchParameters!(helper.state, {
        uiState: {},
      });
      expect(searchParameters.relevancyStrictness).toEqual(25);
    });

    it('override parameters with the value from uiState', () => {
      const helper = createHelper();
      const makeWidget = connectRelevantSort(noop);
      const widget = makeWidget({});

      const { refine } = widget.getWidgetRenderState(
        createRenderOptions({ helper })
      );
      refine(25);

      const searchParameters = widget.getWidgetSearchParameters!(
        new SearchParameters(),
        {
          uiState: {
            relevantSort: 15,
          },
        }
      );
      expect(searchParameters.relevancyStrictness).toEqual(15);
    });
  });
});
