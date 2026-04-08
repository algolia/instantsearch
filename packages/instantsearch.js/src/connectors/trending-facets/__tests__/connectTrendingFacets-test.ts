/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
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
      connectTrendingFacets()({ facetName: 'brand' });
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-facets/js/#connector"
    `);
  });

  it('throws without facetName', () => {
    expect(() => {
      connectTrendingFacets(() => {})(
        // @ts-expect-error
        {}
      );
    }).toThrowErrorMatchingInlineSnapshot(`
      "The \`facetName\` option is required.

      See documentation: https://www.algolia.com/doc/api-reference/widgets/trending-facets/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customTrendingFacets = connectTrendingFacets(render, unmount);
    const widget = customTrendingFacets({ facetName: 'brand' });

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
      facetName: 'brand',
    });

    expect(widget.$$type).toBe('ais.trendingFacets');
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectTrendingFacets(renderFn);
    const widget = makeWidget({ facetName: 'brand' });

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
      expect.objectContaining({ widgetParams: { facetName: 'brand' } }),
      true
    );

    const renderOptions = createRenderOptions({
      helper,
    });

    widget.render(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { facetName: 'brand' } }),
      false
    );
  });

  it('returns empty items when results are undefined', () => {
    const renderFn = jest.fn();
    const makeWidget = connectTrendingFacets(renderFn);
    const widget = makeWidget({ facetName: 'brand' });

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
      expect.objectContaining({ items: [] }),
      true
    );
  });

  describe('getWidgetParameters', () => {
    it('forwards widgetParams to the recommend state', () => {
      const render = () => {};
      const makeWidget = connectTrendingFacets(render);
      const widget = makeWidget({
        facetName: 'brand',
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
        new RecommendParameters().addTrendingFacets({
          // @ts-expect-error
          $$id: widget.$$id,
          facetName: 'brand',
          maxRecommendations: 10,
          threshold: 95,
          queryParameters: { userToken: 'token' },
        })
      );
    });

    it('adds escapeHTML tags', () => {
      const render = () => {};
      const makeWidget = connectTrendingFacets(render);
      const widget = makeWidget({
        facetName: 'brand',
        limit: 10,
        threshold: 95,
        queryParameters: { userToken: 'token' },
        escapeHTML: true,
        fallbackParameters: { query: 'query' },
      });

      // @ts-expect-error
      const actual = widget.getWidgetParameters(new RecommendParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(
        new RecommendParameters().addTrendingFacets({
          // @ts-expect-error
          $$id: widget.$$id,
          facetName: 'brand',
          maxRecommendations: 10,
          threshold: 95,
          queryParameters: {
            userToken: 'token',
            highlightPostTag: '__/ais-highlight__',
            highlightPreTag: '__ais-highlight__',
          },
          fallbackParameters: {
            highlightPostTag: '__/ais-highlight__',
            highlightPreTag: '__ais-highlight__',
            query: 'query',
          },
        })
      );
    });
  });
});
