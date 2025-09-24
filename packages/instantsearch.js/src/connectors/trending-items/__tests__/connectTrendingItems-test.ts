/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper, { RecommendParameters } from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectTrendingItems from '../connectTrendingItems';

describe('connectTrendingItems', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-expect-error
      connectTrendingItems()({});
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-items/js/#connector"
    `);
  });

  it('throws if facetName is provided without facetValue', () => {
    expect(() => {
      connectTrendingItems(() => {})({ facetName: 'key' });
    }).toThrowErrorMatchingInlineSnapshot(`
      "When you provide facetName (received type String), you must also provide facetValue (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-items/js/#connector"
    `);
  });

  it('throws if facetValue is provided without facetName', () => {
    expect(() => {
      connectTrendingItems(() => {})({ facetValue: 'value' });
    }).toThrowErrorMatchingInlineSnapshot(`
      "When you provide facetName (received type Undefined), you must also provide facetValue (received type String).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-items/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customTrendingItems = connectTrendingItems(render, unmount);
    const widget = customTrendingItems({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.trendingItems',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('accepts custom parameters', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customTrendingItems = connectTrendingItems<{
      container: string;
    }>(render, unmount);
    const widget = customTrendingItems({ container: '#container' });

    expect(widget.$$type).toBe('ais.trendingItems');
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectTrendingItems(renderFn);
    const widget = makeWidget({});

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
      expect.objectContaining({ widgetParams: {} }),
      true
    );

    const renderOptions = createRenderOptions({
      helper,
    });

    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: {} }),
      false
    );
  });

  describe('getWidgetParameters', () => {
    it('forwards widgetParams to the recommend state', () => {
      const render = () => {};
      const makeWidget = connectTrendingItems(render);
      const widget = makeWidget({
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
        new RecommendParameters().addTrendingItems({
          // @ts-expect-error
          $$id: widget.$$id,
          facetName: undefined,
          facetValue: undefined,
          maxRecommendations: 10,
          threshold: 95,
          queryParameters: { userToken: 'token' },
          fallbackParameters: {},
        })
      );
    });

    it('forwards widgetParams to the recommend state with facet', () => {
      const render = () => {};
      const makeWidget = connectTrendingItems(render);
      const widget = makeWidget({
        facetName: 'key',
        facetValue: 'value',
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
        new RecommendParameters().addTrendingItems({
          // @ts-expect-error
          $$id: widget.$$id,
          facetName: 'key',
          facetValue: 'value',
          maxRecommendations: 10,
          threshold: 95,
          queryParameters: { userToken: 'token' },
          fallbackParameters: {},
        })
      );
    });
  });
});
