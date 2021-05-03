import jsHelper from 'algoliasearch-helper';
import { createSearchClient } from '../../../../test/mock/createSearchClient';
import {
  createDisposeOptions,
  createInitOptions,
  createRenderOptions,
} from '../../../../test/mock/createWidget';
import connectPoweredBy from '../connectPoweredBy';

describe('connectPoweredBy', () => {
  it('throws without rendering function', () => {
    expect(() => {
      // @ts-ignore
      connectPoweredBy();
    }).toThrowErrorMatchingInlineSnapshot(`
"The render function is not valid (received type Undefined).

See documentation: https://www.algolia.com/doc/api-reference/widgets/powered-by/js/#connector"
`);
  });

  it('is a widget', () => {
    const render = jest.fn();
    const unmount = jest.fn();

    const customPoweredBy = connectPoweredBy(render, unmount);
    const widget = customPoweredBy({});

    expect(widget).toEqual(
      expect.objectContaining({
        $$type: 'ais.poweredBy',
        init: expect.any(Function),
        render: expect.any(Function),
        dispose: expect.any(Function),
      })
    );
  });

  it('renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({});

    widget.init!(createInitOptions());

    expect(rendering).toHaveBeenCalledTimes(1);
    expect(rendering).toHaveBeenCalledWith(expect.anything(), true);

    widget.render!(createRenderOptions());

    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(expect.anything(), false);
  });

  it('has a default URL at init', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({});

    widget.init!(createInitOptions());

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({
        url:
          'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
      }),
      true
    );
  });

  it('has a default URL at render', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({});

    widget.render!(createRenderOptions());

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({
        url:
          'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
      }),
      false
    );
  });

  it('can override the URL', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({
      url: '#custom-url',
    });

    widget.init!(createInitOptions());

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({ url: '#custom-url' }),
      true
    );
  });

  it('can override the theme', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy<{ theme: string }>(rendering);
    const widget = makeWidget({
      theme: 'dark',
    });

    widget.init!(createInitOptions());

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({ widgetParams: { theme: 'dark' } }),
      true
    );
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({});
    const helper = jsHelper(createSearchClient(), '');
    expect(() =>
      widget.dispose!(createDisposeOptions({ helper, state: helper.state }))
    ).not.toThrow();
  });

  describe('getWidgetRenderState', () => {
    it('uses a default url', () => {
      const rendering = jest.fn();
      const makeWidget = connectPoweredBy(rendering);
      const widget = makeWidget({});

      expect(widget.getWidgetRenderState(createInitOptions())).toEqual({
        url:
          'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
        widgetParams: {},
      });
    });

    it('uses a custom url', () => {
      const rendering = jest.fn();
      const makeWidget = connectPoweredBy(rendering);
      const widget = makeWidget({
        url: 'hello-world',
      });

      expect(widget.getWidgetRenderState(createInitOptions())).toEqual({
        url: 'hello-world',
        widgetParams: {
          url: 'hello-world',
        },
      });
    });

    it('forwards unknown widget parameters', () => {
      const rendering = jest.fn();
      const makeWidget = connectPoweredBy<{ theme: string }>(rendering);
      const widget = makeWidget({
        theme: 'dark',
      });

      expect(widget.getWidgetRenderState(createInitOptions())).toEqual({
        url:
          'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
        widgetParams: {
          theme: 'dark',
        },
      });
    });
  });

  describe('getRenderState', () => {
    it('uses a default url', () => {
      const rendering = jest.fn();
      const makeWidget = connectPoweredBy(rendering);
      const widget = makeWidget({});

      expect(widget.getRenderState({}, createInitOptions())).toEqual({
        poweredBy: {
          url:
            'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
          widgetParams: {},
        },
      });
    });

    it('uses a custom url', () => {
      const rendering = jest.fn();
      const makeWidget = connectPoweredBy(rendering);
      const widget = makeWidget({
        url: 'hello-world',
      });

      expect(widget.getRenderState({}, createInitOptions())).toEqual({
        poweredBy: {
          url: 'hello-world',
          widgetParams: {
            url: 'hello-world',
          },
        },
      });
    });

    it('forwards unknown widget parameters', () => {
      const rendering = jest.fn();
      const makeWidget = connectPoweredBy<{ theme: string }>(rendering);
      const widget = makeWidget({
        theme: 'dark',
      });

      expect(widget.getRenderState({}, createInitOptions())).toEqual({
        poweredBy: {
          url:
            'https://www.algolia.com/?utm_source=instantsearch.js&utm_medium=website&utm_content=localhost&utm_campaign=poweredby',
          widgetParams: {
            theme: 'dark',
          },
        },
      });
    });
  });
});
