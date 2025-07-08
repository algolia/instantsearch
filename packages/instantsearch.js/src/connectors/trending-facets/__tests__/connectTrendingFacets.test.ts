/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper, { RecommendParameters } from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectTrendingFacets from '../connectTrendingFacets';

describe('connectTrendingFacets', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-expect-error
      connectTrendingFacets()({});
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-facets/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customTrendingFacets = connectTrendingFacets(render, unmount);
    const widget = customTrendingFacets({ attribute: 'one' });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.trendingFacets',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('accepts custom parameters', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customTrendingFacets = connectTrendingFacets<{
      container: string;
    }>(render, unmount);
    const widget = customTrendingFacets({
      container: '#container',
      attribute: 'one',
      limit: 10,
    });

    expect(widget.$$type).toBe('ais.trendingFacets');
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectTrendingFacets(renderFn);
    const widget = makeWidget({ attribute: 'one' });

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
      expect.objectContaining({ widgetParams: { attribute: 'one' } }),
      true
    );

    const renderOptions = createRenderOptions({
      helper,
    });

    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { attribute: 'one' } }),
      false
    );
  });

  describe('getWidgetParameters', () => {
    it('forwards widgetParams to the recommend state', () => {
      const render = () => {};
      const makeWidget = connectTrendingFacets(render);
      const widget = makeWidget({
        attribute: 'one',
        limit: 10,
        threshold: 95,
      });

      // @ts-expect-error
      const actual = widget.getWidgetParameters(new RecommendParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(
        new RecommendParameters().addTrendingFacets({
          // @ts-expect-error
          $$id: widget.$$id,
          facetName: 'one',
          maxRecommendations: 10,
          threshold: 95,
        })
      );
    });
  });
});
