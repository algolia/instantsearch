/**
 * @jest-environment jsdom @instantsearch/testutils/jest-environment-jsdom.ts
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper, { RecommendParameters } from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectRelatedProducts from '../connectRelatedProducts';

describe('connectRelatedProducts', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-expect-error
      connectRelatedProducts()({});
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/related-products/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customRelatedProducts = connectRelatedProducts(render, unmount);
    const widget = customRelatedProducts({ objectIDs: ['1'] });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.relatedProducts',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('accepts custom parameters', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customRelatedProducts = connectRelatedProducts<{
      container: string;
    }>(render, unmount);
    const widget = customRelatedProducts({
      container: '#container',
      objectIDs: ['1'],
    });

    expect(widget.$$type).toBe('ais.relatedProducts');
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectRelatedProducts(renderFn);
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
      const makeWidget = connectRelatedProducts(render);
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
          .addRelatedProducts({
            // @ts-expect-error
            $$id: widget.$$id,
            objectID: '1',
            maxRecommendations: 10,
            threshold: 95,
            queryParameters: { userToken: 'token' },
            fallbackParameters: {},
          })
          .addRelatedProducts({
            // @ts-expect-error
            $$id: widget.$$id,
            objectID: '2',
            maxRecommendations: 10,
            threshold: 95,
            queryParameters: { userToken: 'token' },
            fallbackParameters: {},
          })
      );
    });
  });
});
