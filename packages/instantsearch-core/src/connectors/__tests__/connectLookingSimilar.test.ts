/**
 * @jest-environment jsdom
 */

import { createSearchClient } from '@instantsearch/mocks';
import algoliasearchHelper, { RecommendParameters } from 'algoliasearch-helper';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from 'instantsearch-core/test/createWidget';

import { connectLookingSimilar } from '../..';

describe('connectLookingSimilar', () => {
  it('throws without render function', () => {
    expect(() => {
      // @ts-expect-error
      connectLookingSimilar()({});
    }).toThrowErrorMatchingInlineSnapshot(`
      "The render function is not valid (received type Undefined).

      See documentation: https://www.algolia.com/doc/api-reference/widgets/looking-similar/js/#connector"
    `);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customLookingSimilar = connectLookingSimilar(render, unmount);
    const widget = customLookingSimilar({ objectIDs: ['1'] });

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.lookingSimilar',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('accepts custom parameters', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customLookingSimilar = connectLookingSimilar<{
      container: string;
    }>(render, unmount);
    const widget = customLookingSimilar({
      container: '#container',
      objectIDs: ['1'],
    });

    expect(widget.$$type).toBe('ais.lookingSimilar');
  });

  it('Renders during init and render', () => {
    const renderFn = jest.fn();
    const makeWidget = connectLookingSimilar(renderFn);
    const widget = makeWidget({ objectIDs: ['1'] });

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
      expect.objectContaining({ widgetParams: { objectIDs: ['1'] } }),
      true
    );

    const renderOptions = createRenderOptions({
      helper,
    });

    widget.render!(renderOptions);

    expect(renderFn).toHaveBeenCalledTimes(2);
    expect(renderFn).toHaveBeenLastCalledWith(
      expect.objectContaining({ widgetParams: { objectIDs: ['1'] } }),
      false
    );
  });

  describe('dispose', () => {
    it('calls unmount function', () => {
      const render = jest.fn();
      const unmount = jest.fn();

      const widget = connectLookingSimilar(
        render,
        unmount
      )({ objectIDs: ['1'] });

      widget.dispose!(createDisposeOptions());

      expect(unmount).toHaveBeenCalled();
    });

    it('does not throw without the unmount function', () => {
      const render = () => {};
      const widget = connectLookingSimilar(render)({ objectIDs: ['1'] });
      expect(() => widget.dispose!(createDisposeOptions())).not.toThrow();
    });
  });

  describe('getWidgetParameters', () => {
    it('forwards widgetParams to the recommend state', () => {
      const render = () => {};
      const makeWidget = connectLookingSimilar(render);
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
          .addLookingSimilar({
            // @ts-expect-error
            $$id: widget.$$id,
            objectID: '1',
            maxRecommendations: 10,
            threshold: 95,
            queryParameters: { userToken: 'token' },
            fallbackParameters: {},
          })
          .addLookingSimilar({
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
