/**
 * @jest-environment jsdom
 */

import {
  createSearchClient,
  createSingleSearchResponse,
} from '@instantsearch/mocks';
import algoliasearchHelper, { RecommendParameters } from 'algoliasearch-helper';

import {
  createInitOptions,
  createRenderOptions,
} from '../../../../test/createWidget';
import connectFrequentlyBoughtTogether from '../connectFrequentlyBoughtTogether';

import type { RenderOptions } from '../../../types';
import type { SearchResults } from 'algoliasearch-helper';

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
    const widget = customFbt({ objectID: '1' });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.frequentlyBoughtTogether',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectFrequentlyBoughtTogether(renderFn);
    const widget = makeWidget({ objectID: '1' });

    // test if widget is not rendered yet at this point
    expect(renderFn).toHaveBeenCalledTimes(0);

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
        state: helper.state,
      })
    );

    expect(renderFn).toHaveBeenCalledTimes(1);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { objectID: '1' } }),
      true
    );

    const renderOptions = createRenderOptions({
      helper,
    });

    widget.render!(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { objectID: '1' } }),
      false
    );
  });

  it('Provides the hits and the whole results', () => {
    const renderFn = jest.fn();
    const makeWidget = connectFrequentlyBoughtTogether(renderFn);
    const widget = makeWidget({ objectID: '1' });

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(
      createInitOptions({
        helper,
      })
    );

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits: [],
      }),
      expect.anything()
    );

    const hits = [
      { objectID: '1', fake: 'data' },
      { objectID: '2', sample: 'infos' },
    ];

    const results = createSingleSearchResponse({
      hits,
    }) as unknown as SearchResults;
    widget.render!(
      createRenderOptions({
        results,
      })
    );

    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({
        hits,
      }),
      expect.anything()
    );
  });

  it('transform items if requested', () => {
    const renderFn = jest.fn();
    const makeWidget = connectFrequentlyBoughtTogether(renderFn);
    const widget = makeWidget({
      objectID: '1',
      transformItems: (items) =>
        items.map((item) => ({ ...item, name: 'transformed' })),
    });

    const helper = algoliasearchHelper(createSearchClient(), '', {});
    helper.search = jest.fn();

    widget.init!(createInitOptions({}));

    expect(renderFn).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({ hits: [] }),
      expect.anything()
    );

    const hits = [
      { objectID: '1', name: 'name 1' },
      { objectID: '2', name: 'name 2' },
    ];

    const results = createSingleSearchResponse({
      hits,
    }) as unknown as SearchResults;
    widget.render!(
      createRenderOptions({
        results,
      })
    );

    const expectedHits = [
      { objectID: '1', name: 'transformed' },
      { objectID: '2', name: 'transformed' },
    ];

    expect(renderFn).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        hits: expectedHits,
      }),
      expect.anything()
    );
  });

  it('provides results within transformItems', () => {
    const transformItems = jest.fn((items) => items);
    const makeWidget = connectFrequentlyBoughtTogether(() => {});
    const widget = makeWidget({
      transformItems,
      objectID: '1',
    });

    const results = createSingleSearchResponse({
      hits: [],
    }) as unknown as SearchResults;

    widget.init!(createInitOptions({}));
    widget.render!(
      createRenderOptions({
        results,
      })
    );

    expect(transformItems).toHaveBeenLastCalledWith(
      expect.anything(),
      expect.objectContaining({ results })
    );
  });

  describe('getWidgetRenderState', () => {
    it('returns the widget render state', () => {
      const renderFn = jest.fn();
      const unmountFn = jest.fn();
      const createFbt = connectFrequentlyBoughtTogether(renderFn, unmountFn);
      const fbtWidget = createFbt({ objectID: '1' });

      const renderState1 = fbtWidget.getWidgetRenderState!(
        createInitOptions({})
      );

      expect(renderState1).toEqual({
        hits: [],
        widgetParams: { objectID: '1' },
      });

      const hits = [
        { objectID: '1', name: 'name 1' },
        { objectID: '2', name: 'name 2' },
      ];

      const renderState2 = fbtWidget.getWidgetRenderState!({
        results: { hits },
      } as unknown as RenderOptions);

      expect(renderState2).toEqual({
        hits,
        widgetParams: { objectID: '1' },
      });
    });
  });

  describe('getWidgetParameters', () => {
    it('forwards widgetParams to the recommend state', () => {
      const render = () => {};
      const makeWidget = connectFrequentlyBoughtTogether(render);
      const widget = makeWidget({
        objectID: '1',
        maxRecommendations: 10,
        threshold: 95,
        queryParameters: { userToken: 'token' },
      });

      // @ts-expect-error
      const actual = widget.getWidgetParameters!(new RecommendParameters(), {
        uiState: {},
      });

      expect(actual).toEqual(
        new RecommendParameters().addFrequentlyBoughtTogether({
          // @ts-expect-error
          $$id: widget.$$id,
          objectID: '1',
          maxRecommendations: 10,
          threshold: 95,
          queryParameters: { userToken: 'token' },
        })
      );
    });
  });
});
