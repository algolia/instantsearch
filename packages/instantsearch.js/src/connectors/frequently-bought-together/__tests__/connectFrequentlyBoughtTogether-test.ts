/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */

import {
  createRecommendResponse,
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import { wait } from '@instantsearch/testutils/wait';
import algoliasearchHelper, { RecommendParameters } from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import instantsearch from '../../../index.es';
import connectFrequentlyBoughtTogether from '../connectFrequentlyBoughtTogether';

describe('connectFrequentlyBoughtTogether', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-expect-error
      connectFrequentlyBoughtTogether()({});
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/frequently-bought-together/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customFbt = connectFrequentlyBoughtTogether(render, unmount);
    const widget = customFbt({ objectIDs: ['1'] });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.frequentlyBoughtTogether',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('accepts custom parameters', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customFrequentlyBoughtTogether = connectFrequentlyBoughtTogether<{
      container: string;
    }>(render, unmount);
    const widget = customFrequentlyBoughtTogether({
      container: '#container',
      objectIDs: ['1'],
    });

    expect(widget.$$type).toBe('ais.frequentlyBoughtTogether');
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectFrequentlyBoughtTogether(renderFn);
    const widget = makeWidget({ objectIDs: ['1'] });

    // test if widget is not rendered yet at this point
    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { objectIDs: ['1'] } }),
      true
    );

    const renderOptions = createRenderOptions({
      helper,
    });

    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { objectIDs: ['1'] } }),
      false
    );
  });

  describe('getWidgetParameters', () => {
    it('forwards widgetParams to the recommend state', () => {
      const render = () => {};
      const makeWidget = connectFrequentlyBoughtTogether(render);
      const widget = makeWidget({
        objectIDs: ['1', '2'],
        limit: 10,
        threshold: 95,
        queryParameters: { userToken: 'token' },
        escapeHTML: false,
      });

      // @ts-expect-error
      const actual = widget.getWidgetParameters(new RecommendParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(
        new RecommendParameters()
          .addFrequentlyBoughtTogether({
            // @ts-expect-error
            $$id: widget.$$id,
            objectID: '1',
            maxRecommendations: 10,
            threshold: 95,
            queryParameters: { userToken: 'token' },
          })
          .addFrequentlyBoughtTogether({
            // @ts-expect-error
            $$id: widget.$$id,
            objectID: '2',
            maxRecommendations: 10,
            threshold: 95,
            queryParameters: { userToken: 'token' },
          })
      );
    });
  });
  describe('insights with several objectIDs', () => {
    const setup = async () => {
      const searchClient = createSearchClient({
        getRecommendations: jest.fn((requests) =>
          Promise.resolve(
            createRecommendResponse(
              // @ts-ignore `getRecommendations` isn't typed in v3
              requests.map((request: { objectID?: string }) =>
                createSingleSearchResponse(
                  request.objectID === '1'
                    ? {
                        queryID: 'q1',
                        hits: [{ objectID: 'a' }, { objectID: 'b' }],
                      }
                    : {
                        queryID: 'q2',
                        hits: [{ objectID: 'c' }, { objectID: 'a' }],
                      }
                )
              )
            )
          )
        ),
      });
      const renderFn = jest.fn();
      const search = instantsearch({ indexName: 'indexName', searchClient });
      search.addWidgets([
        connectFrequentlyBoughtTogether(renderFn)({ objectIDs: ['1', '2'] }),
      ]);
      search.start();
      await wait(0);
      search.sendEventToInsights = jest.fn();

      const { items, sendEvent } =
        renderFn.mock.calls[renderFn.mock.calls.length - 1][0];

      return { search, items, sendEvent };
    };

    it('sends a click with the queryID of the request that returned the item', async () => {
      const { search, items, sendEvent } = await setup();

      expect(items.map((item: any) => item.objectID)).toEqual(['a', 'c', 'b']);

      sendEvent('click', items[1], 'Product Clicked');

      expect(search.sendEventToInsights).toHaveBeenCalledTimes(1);
      expect(
        (search.sendEventToInsights as jest.Mock).mock.calls[0][0].payload
      ).toEqual({
        eventName: 'Product Clicked',
        index: 'indexName',
        queryID: 'q2',
        objectIDs: ['c'],
        positions: [2],
      });
    });

    it("sends a single conversion carrying each item's queryID", async () => {
      const { search, items, sendEvent } = await setup();

      sendEvent('conversion', items, 'Product Purchased', {
        value: 30,
        currency: 'USD',
      });

      expect(search.sendEventToInsights).toHaveBeenCalledTimes(1);
      expect(
        (search.sendEventToInsights as jest.Mock).mock.calls[0][0].payload
      ).toEqual({
        eventName: 'Product Purchased',
        index: 'indexName',
        queryID: 'q1',
        objectIDs: ['a', 'c', 'b'],
        objectData: [{ queryID: 'q1' }, { queryID: 'q2' }, { queryID: 'q1' }],
        value: 30,
        currency: 'USD',
      });
    });
  });
});
