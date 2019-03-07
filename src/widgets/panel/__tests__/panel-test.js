import { render, unmountComponentAtNode } from 'preact-compat';
import panel from '../panel';

jest.mock('preact-compat', () => {
  const module = require.requireActual('preact-compat');

  module.render = jest.fn();
  module.unmountComponentAtNode = jest.fn();

  return module;
});

beforeEach(() => {
  render.mockClear();
});

describe('Usage', () => {
  test('without arguments does not throw', () => {
    expect(() => {
      panel();
    }).not.toThrow();
  });

  test('with templates does not throw', () => {
    expect(() => {
      panel({
        templates: { header: 'header' },
      });
    }).not.toThrow();
  });

  test('with `hidden` as function does not throw', () => {
    expect(() => {
      panel({
        hidden: () => true,
      });
    }).not.toThrow();
  });

  test('with `collapsed` as function does not throw', () => {
    expect(() =>
      panel({
        collapsed: () => true,
      })
    ).not.toThrow();
  });

  test('with `hidden` as boolean warns', () => {
    expect(() => {
      panel({
        hidden: true,
      });
    }).toWarnDev(
      '[InstantSearch.js]: The `hidden` option in the "panel" widget expects a function returning a boolean (received "boolean" type).'
    );
  });

  test('with `collapsed` as boolean warns', () => {
    expect(() => {
      panel({
        collapsed: true,
      });
    }).toWarnDev(
      '[InstantSearch.js]: The `collapsed` option in the "panel" widget expects a function returning a boolean (received "boolean" type).'
    );
  });

  test('with a widget without `container` throws', () => {
    const fakeWidget = () => {};
    const fakeWithWithPanel = panel()(fakeWidget);

    expect(() => {
      fakeWithWithPanel({});
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required in the widget within the panel.

See documentation: https://www.algolia.com/doc/api-reference/widgets/panel/js/"
`);
  });
});

describe('Templates', () => {
  let widgetFactory;

  beforeEach(() => {
    const widget = {
      init: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    };
    widgetFactory = () => widget;
  });

  test('with default templates', () => {
    const widgetWithPanel = panel({})(widgetFactory);

    widgetWithPanel({
      container: document.createElement('div'),
    });

    const { templates } = render.mock.calls[0][0].props.templateProps;

    expect(templates).toEqual({
      header: '',
      footer: '',
      collapseButtonText: expect.any(Function),
    });
  });

  test('with header template', () => {
    const widgetWithPanel = panel({
      templates: {
        header: 'Custom header',
      },
    })(widgetFactory);

    widgetWithPanel({
      container: document.createElement('div'),
    });

    const { templates } = render.mock.calls[0][0].props.templateProps;

    expect(templates.header).toBe('Custom header');
  });

  test('with footer template', () => {
    const widgetWithPanel = panel({
      templates: {
        footer: 'Custom footer',
      },
    })(widgetFactory);

    widgetWithPanel({
      container: document.createElement('div'),
    });

    const { templates } = render.mock.calls[0][0].props.templateProps;

    expect(templates.footer).toBe('Custom footer');
  });

  test('with collapseButtonText template', () => {
    const widgetWithPanel = panel({
      templates: {
        collapseButtonText: 'Custom collapseButtonText',
      },
    })(widgetFactory);

    widgetWithPanel({
      container: document.createElement('div'),
    });

    const { templates } = render.mock.calls[0][0].props.templateProps;

    expect(templates.collapseButtonText).toBe('Custom collapseButtonText');
  });
});

describe('Lifecycle', () => {
  beforeEach(() => {
    render.mockClear();
    unmountComponentAtNode.mockClear();
  });

  test('calls the inner widget lifecycle', () => {
    const widget = {
      init: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    };
    const widgetFactory = () => widget;

    const widgetWithPanel = panel()(widgetFactory)({
      container: document.createElement('div'),
    });

    widgetWithPanel.init({});
    widgetWithPanel.render({});
    widgetWithPanel.dispose({});

    expect(widget.init).toHaveBeenCalledTimes(1);
    expect(widget.render).toHaveBeenCalledTimes(1);
    expect(widget.dispose).toHaveBeenCalledTimes(1);
  });
});
