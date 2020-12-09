import jsHelper from 'algoliasearch-helper';
const SearchResults = jsHelper.SearchResults;
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import { createSingleSearchResponse } from '../../../../test/mock/createAPIResponse';
import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';

import connectStats from '../connectStats';

describe('connectStats', () => {
  const getInitializedWidget = (config = {}) => {
    const renderFn = jest.fn();
    const makeWidget = connectStats(renderFn);
    const widget = makeWidget({
      ...config,
    });

    const helper = jsHelper(createSearchClient(), 'indexName', {
      index: 'indexName',
    });

    widget.init(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    return [widget, helper];
  };

  describe('Usage', () => {
    it('throws without render function', () => {
      expect(() => {
        connectStats()({});
      }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/stats/js/#connector"
`);
    });

    it('is a widget', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const customStats = connectStats(render, unmount);
      const widget = customStats({});

      expect(widget).toEqual(
        expect.objectContaining({
          $$type: 'ais.stats',
          init: expect.any(Function),
          render: expect.any(Function),
          dispose: expect.any(Function),
        })
      );
    });
  });

  describe('getRenderState', () => {
    test('returns the widget render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createStats = connectStats(renderFn, unmountFn);
      const stats = createStats();
      const helper = jsHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const renderState = stats.getRenderState(
        { stats: {} },
        createInitOptions({ helper })
      );

      expect(renderState.stats).toEqual({
        hitsPerPage: undefined,
        nbHits: 0,
        nbPages: 0,
        page: 0,
        processingTimeMS: -1,
        query: '',
        widgetParams: {},
      });
    });

    test('returns the widget render state with empty results', () => {
      const [stats, helper] = getInitializedWidget();

      const renderState = stats.getRenderState(
        { stats: {} },
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
        })
      );

      expect(renderState.stats).toEqual({
        hitsPerPage: 20,
        nbHits: 0,
        nbPages: 0,
        page: 0,
        processingTimeMS: 0,
        query: '',
        widgetParams: {},
      });
    });

    test('returns the widget render state with results', () => {
      const [stats, helper] = getInitializedWidget();

      const renderState = stats.getRenderState(
        { stats: {} },
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [
                { brand: 'samsung', objectID: '1' },
                { brand: 'apple', objectID: '2' },
                { brand: 'sony', objectID: '3' },
                { brand: 'benq', objectID: '4' },
                { brand: 'dyson', objectID: '5' },
              ],
              hitsPerPage: 3,
              query: 'apple',
            }),
          ]),
        })
      );

      expect(renderState.stats).toEqual({
        hitsPerPage: 3,
        nbHits: 5,
        nbPages: 2,
        page: 0,
        processingTimeMS: 0,
        query: 'apple',
        widgetParams: {},
      });
    });
  });

  describe('getWidgetRenderState', () => {
    test('returns the widget render state without results', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createStats = connectStats(renderFn, unmountFn);
      const stats = createStats();
      const helper = jsHelper(createSearchClient(), 'indexName', {
        index: 'indexName',
      });

      const renderState = stats.getWidgetRenderState(
        createInitOptions({ helper })
      );

      expect(renderState).toEqual({
        hitsPerPage: undefined,
        nbHits: 0,
        nbPages: 0,
        page: 0,
        processingTimeMS: -1,
        query: '',
        widgetParams: {},
      });
    });

    test('returns the widget render state with empty results', () => {
      const [stats, helper] = getInitializedWidget();

      const renderState = stats.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse(),
          ]),
        })
      );

      expect(renderState).toEqual({
        hitsPerPage: 20,
        nbHits: 0,
        nbPages: 0,
        page: 0,
        processingTimeMS: 0,
        query: '',
        widgetParams: {},
      });
    });

    test('returns the widget render state with results', () => {
      const [stats, helper] = getInitializedWidget();

      const renderState = stats.getWidgetRenderState(
        createRenderOptions({
          helper,
          state: helper.state,
          results: new SearchResults(helper.state, [
            createSingleSearchResponse({
              hits: [
                { brand: 'samsung', objectID: '1' },
                { brand: 'apple', objectID: '2' },
                { brand: 'sony', objectID: '3' },
                { brand: 'benq', objectID: '4' },
                { brand: 'dyson', objectID: '5' },
              ],
              hitsPerPage: 3,
              query: 'apple',
            }),
          ]),
        })
      );

      expect(renderState).toEqual({
        hitsPerPage: 3,
        nbHits: 5,
        nbPages: 2,
        page: 0,
        processingTimeMS: 0,
        query: 'apple',
        widgetParams: {},
      });
    });
  });

  it('Renders during init and render', () => {
    // test that the dummyRendering is called with the isFirstRendering
    // flag set accordingly
    const rendering = jest.fn();
    const makeWidget = connectStats(rendering);

    const widget = makeWidget({
      foo: 'bar', // dummy param to test `widgetParams`
    });

    const helper = jsHelper({});
    helper.search = jest.fn();

    widget.init({
      helper,
      state: helper.state,
      createURL: () => '#',
    });

    {
      // should call the rendering once with isFirstRendering to true
      expect(rendering).toHaveBeenCalledTimes(1);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(true);

      // should provide good values for the first rendering
      const {
        hitsPerPage,
        nbHits,
        nbPages,
        page,
        processingTimeMS,
        query,
        widgetParams,
      } = rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(hitsPerPage).toBe(helper.state.hitsPerPage);
      expect(nbHits).toBe(0);
      expect(nbPages).toBe(0);
      expect(page).toBe(0);
      expect(processingTimeMS).toBe(-1);
      expect(query).toBe('');
      expect(widgetParams).toEqual({ foo: 'bar' });
    }

    widget.render({
      results: new SearchResults(helper.state, [
        {
          hits: [{ One: 'record' }],
          nbPages: 1,
          nbHits: 1,
          hitsPerPage: helper.state.hitsPerPage,
          page: helper.state.page,
          query: '',
          processingTimeMS: 12,
        },
      ]),
      state: helper.state,
      helper,
      createURL: () => '#',
    });

    {
      // Should call the rendering a second time, with isFirstRendering to false
      expect(rendering).toHaveBeenCalledTimes(2);
      const isFirstRendering =
        rendering.mock.calls[rendering.mock.calls.length - 1][1];
      expect(isFirstRendering).toBe(false);

      // should provide good values after the first search
      const {
        hitsPerPage,
        nbHits,
        nbPages,
        page,
        processingTimeMS,
        query,
      } = rendering.mock.calls[rendering.mock.calls.length - 1][0];
      expect(hitsPerPage).toBe(helper.state.hitsPerPage);
      expect(nbHits).toBe(1);
      expect(nbPages).toBe(1);
      expect(page).toBe(helper.state.page);
      expect(processingTimeMS).toBe(12);
      expect(query).toBe('');
    }
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectStats(rendering);
    const widget = makeWidget({});
    const helper = jsHelper({});
    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
  });
});
