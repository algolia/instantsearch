import { withInsights, inferInsightsPayload } from '../insights';
import { Widget } from '../../types';

const connectHits = (renderFn: any, unmountFn: any) => (
  widgetParams = {}
): Widget => ({
  $$type: 'ais.hits',
  init() {},
  render({ results, instantSearchInstance }) {
    const hits = results.hits;
    renderFn({ hits, results, instantSearchInstance, widgetParams }, false);
  },
  dispose() {
    unmountFn();
  },
});

const createWidgetWithInsights = ({
  renderFn,
  instantSearchInstance,
  results,
}): Widget => {
  const connectHitsWithInsights = withInsights(connectHits as any);
  const widget = connectHitsWithInsights(renderFn, jest.fn())({});
  (widget as any).render({ results, instantSearchInstance } as any);
  return widget;
};

describe('withInsights', () => {
  describe('when applied on connectHits', () => {
    it('should call the passed renderFn', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      expect(renderFn).toHaveBeenCalledTimes(1);
    });

    it('should not remove any renderProps passed by connectHits', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(renderProps).toEqual(
        expect.objectContaining({
          instantSearchInstance,
          results,
          widgetParams: {},
        })
      );
    });

    it('should expose the insights client wrapper to renderOptions if passed to instantSearchInstance', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(renderProps).toHaveProperty('insights');
      expect(renderProps.insights).toBeInstanceOf(Function);
    });
    it('should expose the insights client wrapper even when insightsClient was not provided', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = {
        /* insightsClient was not passed */
      };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(renderProps).toHaveProperty('insights');
      expect(renderProps.insights).toBeInstanceOf(Function);
    });
    it('should expose the insights client wrapper that throws when insightsClient was not provided', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = {
        /* insightsClient was not passed */
      };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedObjectIDsAfterSearch', {
          eventName: 'add to favorites',
          objectIDs: ['1'],
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"The \`insightsClient\` option has not been provided to \`instantsearch\`.

See documentation: https://www.algolia.com/doc/api-reference/widgets/instantsearch/js/"
`);
    });
  });

  describe('exposed insights client wrapper', () => {
    it('should call the insights client under the hood', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      renderProps.insights('clickedObjectIDsAfterSearch', {
        objectIDs: ['3'],
        eventName: 'Add to basket',
      });
      expect(instantSearchInstance.insightsClient).toHaveBeenCalledTimes(1);
    });

    it('should pass it the correct parameters', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      renderProps.insights('clickedObjectIDsAfterSearch', {
        objectIDs: ['3'],
        eventName: 'Add to basket',
      });
      const [
        method,
        payload,
      ] = instantSearchInstance.insightsClient.mock.calls[0];
      expect(method).toEqual('clickedObjectIDsAfterSearch');
      expect(payload).toEqual({
        eventName: 'Add to basket',
        index: 'theIndex',
        queryID: 'theQueryID',
        objectIDs: ['3'],
        positions: [11],
      });
    });

    it('should not infer or pass the positions if method is `convertedObjectIDsAfterSearch`', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      renderProps.insights('convertedObjectIDsAfterSearch', {
        objectIDs: ['1'],
        eventName: 'Add to basket',
      });
      const [
        method,
        payload,
      ] = instantSearchInstance.insightsClient.mock.calls[0];
      expect(method).toEqual('convertedObjectIDsAfterSearch');
      expect(payload).toEqual({
        eventName: 'Add to basket',
        index: 'theIndex',
        queryID: 'theQueryID',
        objectIDs: ['1'],
      });
    });

    it('should reject non-existing objectIDs', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedObjectIDsAfterSearch', {
          objectIDs: ['xxxxxx'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Could not find objectID \\"xxxxxx\\" passed to \`clickedObjectIDsAfterSearch\` in the returned hits. This is necessary to infer the absolute position and the query ID."`
      );
    });

    it('should reject if objectIDs provided have different queryIDs', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __position: 1, __queryID: 'theQueryID_1' },
          { objectID: '2', __position: 2, __queryID: 'theQueryID_2' },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedObjectIDsAfterSearch', {
          objectIDs: ['1', '2'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Insights currently allows a single \`queryID\`. The \`objectIDs\` provided map to multiple \`queryID\`s."`
      );
    });

    it('should reject if no queryID found (clickAnalytics was not set to true)', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __position: 1 },
          { objectID: '2', __position: 2 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('clickedObjectIDsAfterSearch', {
          objectIDs: ['1', '2'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(`
"Could not infer \`queryID\`. Ensure InstantSearch \`clickAnalytics: true\` was added with the Configure widget.

See: https://alg.li/lNiZZ7"
`);
    });

    it('should reject unknown method name', () => {
      const renderFn = jest.fn();
      const instantSearchInstance = { insightsClient: jest.fn() };
      const results = {
        index: 'theIndex',
        hits: [
          { objectID: '1', __queryID: 'theQueryID', __position: 9 },
          { objectID: '2', __queryID: 'theQueryID', __position: 10 },
          { objectID: '3', __queryID: 'theQueryID', __position: 11 },
          { objectID: '4', __queryID: 'theQueryID', __position: 12 },
        ],
      };
      createWidgetWithInsights({ renderFn, instantSearchInstance, results });

      const [renderProps] = renderFn.mock.calls[0];
      expect(() => {
        renderProps.insights('unknow_method', {
          objectIDs: ['3'],
          eventName: 'Add to basket',
        });
      }).toThrowErrorMatchingInlineSnapshot(
        `"Unsupported method passed to insights: \\"unknow_method\\"."`
      );
    });
  });
});

describe('inferInsightsPayload', () => {
  const hits: any = [
    { objectID: '1', __queryID: 'theQueryID', __position: 9 },
    { objectID: '2', __queryID: 'theQueryID', __position: 10 },
    { objectID: '3', __queryID: 'theQueryID', __position: 11 },
    { objectID: '4', __queryID: 'theQueryID', __position: 12 },
  ];
  const results: any = {
    index: 'theIndex',
    hits,
  };

  describe('payload inferring', () => {
    it('should infer queryID from results', () => {
      const payload = inferInsightsPayload({
        method: 'clickedObjectIDsAfterSearch',
        results,
        hits,
        objectIDs: ['3'],
      });
      expect(payload.queryID).toEqual('theQueryID');
    });

    it('should infer index name from results', () => {
      const payload = inferInsightsPayload({
        method: 'clickedObjectIDsAfterSearch',
        results,
        hits,
        objectIDs: ['3'],
      });
      expect(payload.index).toEqual(results.index);
    });

    it('should inject passed objectIDs', () => {
      const payload = inferInsightsPayload({
        method: 'clickedObjectIDsAfterSearch',
        results,
        hits,
        objectIDs: ['3', '4'],
      });
      expect(payload.objectIDs).toEqual(['3', '4']);
    });

    it('should compute and inject hit positions', () => {
      const payload = inferInsightsPayload({
        method: 'clickedObjectIDsAfterSearch',
        results,
        hits,
        objectIDs: ['3', '4'],
      });
      expect(payload.positions).toEqual([11, 12]);
    });
  });
});
