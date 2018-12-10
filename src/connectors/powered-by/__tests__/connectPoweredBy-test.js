import connectPoweredBy from '../connectPoweredBy';

describe('connectPoweredBy', () => {
  it('renders during init and render', () => {
    const rendering = jest.fn();
    const makeWidget = connectPoweredBy(rendering);
    const widget = makeWidget();

    // does not have a getConfiguration method
    expect(widget.getConfiguration).toBe(undefined);

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
});
