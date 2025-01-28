/**
 * @jest-environment jsdom
 */

import { castToJestMock } from '@instantsearch/testutils/castToJestMock';
import {
  createInitOptions,
  createRenderOptions,
  createDisposeOptions,
} from 'instantsearch-core/test/createWidget';
import { render as preactRender } from 'preact';

import panel from '../panel';

import type { PanelProps } from '../../../components/Panel/Panel';
import type { Widget } from '../../../types';
import type { VNode } from 'preact';

const render = castToJestMock(preactRender);
jest.mock('preact', () => {
  const module = jest.requireActual('preact');

  module.render = jest.fn();

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
        templates: { header: () => 'header' },
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
        // @ts-expect-error
        hidden: true,
      });
    }).toWarnDev(
      '[InstantSearch]: The `hidden` option in the "panel" widget expects a function returning a boolean (received type Boolean).'
    );
  });

  test('with `collapsed` as boolean warns', () => {
    expect(() => {
      panel({
        // @ts-expect-error
        collapsed: true,
      });
    }).toWarnDev(
      '[InstantSearch]: The `collapsed` option in the "panel" widget expects a function returning a boolean (received type Boolean).'
    );
  });

  test('with a widget without `container` throws', () => {
    const fakeWidget = () => ({ $$type: 'mock.widget' });
    const fakeWithPanel = panel()(fakeWidget);

    expect(() => {
      // @ts-expect-error
      fakeWithPanel();
    }).toThrowErrorMatchingInlineSnapshot(`
"The \`container\` option is required in the widget within the panel.

See documentation: https://www.algolia.com/doc/api-reference/widgets/panel/js/"
`);
  });
});

describe('Templates', () => {
  let widgetFactory: () => Widget<{
    $$type: '';
    widgetParams: Record<string, any>;
  }>;

  beforeEach(() => {
    const widget: Widget<{
      $$type: '';
      widgetParams: Record<string, any>;
    }> = {
      $$type: '',
      init: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    };
    widgetFactory = () => widget;
  });

  test('with default templates', () => {
    const widgetWithPanel = panel()(widgetFactory);

    const widget = widgetWithPanel({
      container: document.createElement('div'),
    });

    widget.init!(createInitOptions());

    const firstRender = render.mock.calls[0][0] as VNode<
      PanelProps<typeof widgetFactory>
    >;
    const { templates } = firstRender.props as PanelProps<typeof widgetFactory>;

    expect(templates).toEqual({
      collapseButtonText: expect.any(Function),
    });
  });

  test('with header template', () => {
    const headerTemplate = () => 'Custom header';
    const widgetWithPanel = panel({
      templates: {
        header: headerTemplate,
      },
    })(widgetFactory);

    const widget = widgetWithPanel({
      container: document.createElement('div'),
    });

    widget.init!(createInitOptions());

    const firstRender = render.mock.calls[0][0] as VNode<
      PanelProps<typeof widgetFactory>
    >;
    const { templates } = firstRender.props as PanelProps<typeof widgetFactory>;

    expect(templates.header).toBe(headerTemplate);
  });

  test('with footer template', () => {
    const footerTemplate = () => 'Custom footer';
    const widgetWithPanel = panel({
      templates: {
        footer: footerTemplate,
      },
    })(widgetFactory);

    const widget = widgetWithPanel({
      container: document.createElement('div'),
    });

    widget.init!(createInitOptions());

    const firstRender = render.mock.calls[0][0] as VNode<
      PanelProps<typeof widgetFactory>
    >;
    const { templates } = firstRender.props as PanelProps<typeof widgetFactory>;

    expect(templates.footer).toBe(footerTemplate);
  });

  test('with collapseButtonText template', () => {
    const collapseButtonTextTemplate = () => 'Custom collapseButtonText';
    const widgetWithPanel = panel({
      templates: {
        collapseButtonText: collapseButtonTextTemplate,
      },
    })(widgetFactory);

    const widget = widgetWithPanel({
      container: document.createElement('div'),
    });

    widget.init!(createInitOptions());

    const firstRender = render.mock.calls[0][0] as VNode<
      PanelProps<typeof widgetFactory>
    >;
    const { templates } = firstRender.props as PanelProps<typeof widgetFactory>;

    expect(templates.collapseButtonText).toBe(collapseButtonTextTemplate);
  });
});

describe('Lifecycle', () => {
  beforeEach(() => {
    render.mockClear();
  });

  test('calls the inner widget lifecycle', () => {
    const widget = {
      $$type: 'mock.widget',
      init: jest.fn(),
      render: jest.fn(),
      dispose: jest.fn(),
    };
    const widgetFactory = () => widget;

    const widgetWithPanel = panel()(widgetFactory)({
      container: document.createElement('div'),
    });

    widgetWithPanel.init!(createInitOptions());
    widgetWithPanel.render!(createRenderOptions());
    widgetWithPanel.dispose!(createDisposeOptions());

    expect(widget.init).toHaveBeenCalledTimes(1);
    expect(widget.render).toHaveBeenCalledTimes(1);
    expect(widget.dispose).toHaveBeenCalledTimes(1);
  });

  describe('init', () => {
    test("calls the wrapped widget's init", () => {
      const widget = {
        $$type: 'mock.widget',
        init: jest.fn(),
      };
      const widgetFactory = () => widget;

      const widgetWithPanel = panel()(widgetFactory)({
        container: document.createElement('div'),
      });

      const initOptions = createInitOptions();

      widgetWithPanel.init!(initOptions);

      expect(widget.init).toHaveBeenCalledTimes(1);
      expect(widget.init).toHaveBeenCalledWith(initOptions);
    });

    test('does not call hidden and collapsed yet', () => {
      const renderState = {
        widgetParams: {},
        swag: true,
      };

      const widget = {
        $$type: 'mock.widget',
        render: jest.fn(),
        getWidgetRenderState() {
          return renderState;
        },
      };

      const widgetFactory = () => widget;

      const hiddenFn = jest.fn();
      const collapsedFn = jest.fn();

      const widgetWithPanel = panel({
        hidden: hiddenFn,
        collapsed: collapsedFn,
      })(widgetFactory)({
        container: document.createElement('div'),
      });

      const initOptions = createInitOptions();

      widgetWithPanel.init!(initOptions);

      expect(hiddenFn).toHaveBeenCalledTimes(0);
      expect(collapsedFn).toHaveBeenCalledTimes(0);
    });

    test('renders with render state', () => {
      const renderState = {
        widgetParams: {},
        swag: true,
      };

      const widget = {
        $$type: 'mock.widget',
        render: jest.fn(),
        getWidgetRenderState() {
          return renderState;
        },
      };

      const widgetFactory = () => widget;

      const widgetWithPanel = panel()(widgetFactory)({
        container: document.createElement('div'),
      });

      const initOptions = createInitOptions();

      widgetWithPanel.init!(initOptions);

      const firstRender = render.mock.calls[0][0] as VNode<
        PanelProps<typeof widgetFactory>
      >;

      expect(firstRender.props).toEqual(
        expect.objectContaining({
          hidden: true,
          collapsible: false,
          isCollapsed: false,
          data: {
            ...renderState,
            ...initOptions,
          },
        })
      );
    });
  });

  describe('render', () => {
    test("calls the wrapped widget's render", () => {
      const widget = {
        $$type: 'mock.widget',
        render: jest.fn(),
      };
      const widgetFactory = () => widget;

      const widgetWithPanel = panel()(widgetFactory)({
        container: document.createElement('div'),
      });

      const renderOptions = createRenderOptions();

      widgetWithPanel.render!(renderOptions);

      expect(widget.render).toHaveBeenCalledTimes(1);
      expect(widget.render).toHaveBeenCalledWith(renderOptions);
    });

    test("calls hidden and collapsed with the wrapped widget's render state", () => {
      const renderState = {
        widgetParams: {},
        swag: true,
      };

      const widget = {
        $$type: 'mock.widget',
        render: jest.fn(),
        getWidgetRenderState() {
          return renderState;
        },
      };

      const widgetFactory = () => widget;

      const hiddenFn = jest.fn();
      const collapsedFn = jest.fn();

      const widgetWithPanel = panel({
        hidden: hiddenFn,
        collapsed: collapsedFn,
      })(widgetFactory)({
        container: document.createElement('div'),
      });

      const renderOptions = createRenderOptions();

      widgetWithPanel.render!(renderOptions);

      expect(hiddenFn).toHaveBeenCalledTimes(1);
      expect(hiddenFn).toHaveBeenCalledWith({
        ...renderState,
        ...renderOptions,
      });

      expect(collapsedFn).toHaveBeenCalledTimes(1);
      expect(collapsedFn).toHaveBeenCalledWith({
        ...renderState,
        ...renderOptions,
      });
    });

    test('renders with render state', () => {
      const renderState = {
        widgetParams: {},
        swag: true,
      };

      const widget = {
        $$type: 'mock.widget',
        render: jest.fn(),
        getWidgetRenderState() {
          return renderState;
        },
      };

      const widgetFactory = () => widget;

      const widgetWithPanel = panel()(widgetFactory)({
        container: document.createElement('div'),
      });

      const renderOptions = createRenderOptions();

      widgetWithPanel.render!(renderOptions);

      const firstRender = render.mock.calls[0][0] as VNode<
        PanelProps<typeof widgetFactory>
      >;

      expect(firstRender.props).toEqual(
        expect.objectContaining({
          hidden: false,
          collapsible: false,
          isCollapsed: false,
          data: {
            ...renderState,
            ...renderOptions,
          },
        })
      );
    });
  });

  describe('dispose', () => {
    test("returns the state from the widget's dispose function", () => {
      const widget = {
        $$type: 'mock.widget',
        init: jest.fn(),
        dispose: jest.fn(),
      };
      const widgetFactory = () => widget;

      const widgetWithPanel = panel()(widgetFactory)({
        container: document.createElement('div'),
      });

      widgetWithPanel.dispose!(createDisposeOptions());

      expect(widget.dispose).toHaveBeenCalled();
    });
  });
});
