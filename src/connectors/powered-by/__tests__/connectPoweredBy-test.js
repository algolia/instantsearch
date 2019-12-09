import jsHelper from 'algoliasearch-helper';
import connectPoweredBy from '../connectPoweredBy';

describe('connectPoweredBy', () => {
  it('throws without rendering function', () => {
    expect(() => {
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
    const widget = makeWidget();

    widget.init({});

    expect(rendering).toHaveBeenCalledTimes(1);
    expect(rendering).toHaveBeenCalledWith(expect.anything(), true);

    widget.render({});

    expect(rendering).toHaveBeenCalledTimes(2);
    expect(rendering).toHaveBeenLastCalledWith(expect.anything(), false);
  });

  it('has a default URL at init', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget();

    widget.init({});

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
    const widget = makeWidget();

    widget.render({});

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

    widget.init({});

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({ url: '#custom-url' }),
      true
    );
  });

  it('can override the theme', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({
      theme: 'dark',
    });

    widget.init({});

    expect(rendering).toHaveBeenCalledWith(
      expect.objectContaining({ widgetParams: { theme: 'dark' } }),
      true
    );
  });

  it('does not throw without the unmount function', () => {
    const rendering = () => {};
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget({});
    const helper = jsHelper({});
    expect(() => widget.dispose({ helper, state: helper.state })).not.toThrow();
  });
});
