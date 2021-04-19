/** @jsx h */

import { h, render } from 'preact';
import cx from 'classnames';
import {
  createDocumentationMessageGenerator,
  getContainerNode,
  getObjectType,
  warning,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import Panel from '../../components/Panel/Panel';
import { Template, RenderOptions, WidgetFactory } from '../../types';

export type PanelCSSClasses = {
  /**
   * CSS classes to add to the root element of the widget.
   */
  root?: string | string[];

  /**
   * CSS classes to add to the root element of the widget when there's no refinements.
   */
  noRefinementRoot?: string | string[];

  /**
   * CSS classes to add to the root element when collapsible (`collapse` is defined).
   */
  collapsibleRoot?: string | string[];

  /**
   * CSS classes to add to the root element when collapsed.
   */
  collapsedRoot?: string | string[];

  /**
   * CSS classes to add to the collapse button element.
   */
  collapseButton?: string | string[];

  /**
   * CSS classes to add to the collapse icon of the button.
   */
  collapseIcon?: string | string[];

  /**
   * CSS classes to add to the header.
   */
  header?: string | string[];

  /**
   * CSS classes to add to the body.
   */
  body?: string | string[];

  /**
   * CSS classes to add to the footer.
   */
  footer?: string | string[];
};

type AnyWidgetFactory = WidgetFactory<
  {
    $$type: string;
  },
  Record<string, any>,
  // @TODO: this really should be _at least_ { container: string | HTMLElement }
  // but that or { container: string | HTMLElement; [key: string]: any }
  // still doesn't allow wider types with another key required.
  any
>;

export type PanelTemplates<TWidget extends AnyWidgetFactory> = {
  /**
   * Template to use for the header.
   */
  header?: Template<PanelRenderOptions<TWidget>>;

  /**
   * Template to use for the footer.
   */
  footer?: Template<PanelRenderOptions<TWidget>>;

  /**
   * Template to use for collapse button.
   */
  collapseButtonText?: Template<{ collapsed: boolean }>;
};

type GetWidgetRenderState<TWidgetFactory extends AnyWidgetFactory> = ReturnType<
  TWidgetFactory
>['getWidgetRenderState'] extends (renderOptions: any) => infer TRenderState
  ? TRenderState extends Record<string, unknown>
    ? TRenderState
    : never
  : Record<string, unknown>;

export type PanelRenderOptions<
  TWidgetFactory extends AnyWidgetFactory
> = RenderOptions & GetWidgetRenderState<TWidgetFactory>;

export type PanelWidgetParams<TWidgetFactory extends AnyWidgetFactory> = {
  /**
   * A function that is called on each render to determine if the
   * panel should be hidden based on the render options.
   */
  hidden?(options: PanelRenderOptions<TWidgetFactory>): boolean;

  /**
   * A function that is called on each render to determine if the
   * panel should be collapsed based on the render options.
   */
  collapsed?(options: PanelRenderOptions<TWidgetFactory>): boolean;

  /**
   * The templates to use for the widget.
   */
  templates?: PanelTemplates<TWidgetFactory>;

  /**
   * The CSS classes to override.
   */
  cssClasses?: PanelCSSClasses;
};

const withUsage = createDocumentationMessageGenerator({ name: 'panel' });
const suit = component('Panel');

const renderer = <TWidget extends AnyWidgetFactory>({
  containerNode,
  bodyContainerNode,
  cssClasses,
  templates,
}) => ({ options, hidden, collapsible, collapsed }) => {
  render(
    <Panel<TWidget>
      cssClasses={cssClasses}
      hidden={hidden}
      collapsible={collapsible}
      isCollapsed={collapsed}
      templates={templates}
      data={options}
      bodyElement={bodyContainerNode}
    />,
    containerNode
  );
};

export type PanelWidget = <TWidgetFactory extends AnyWidgetFactory>(
  panelWidgetParams?: PanelWidgetParams<TWidgetFactory>
) => (
  widgetFactory: TWidgetFactory
) => (
  widgetParams: Parameters<TWidgetFactory>[0]
) => ReturnType<TWidgetFactory>;

/**
 * The panel widget wraps other widgets in a consistent panel design.
 * It also reacts, indicates and sets CSS classes when widgets are no longer relevant for refining.
 */
const panel: PanelWidget = panelWidgetParams => {
  const {
    templates = {},
    hidden = () => false,
    collapsed,
    cssClasses: userCssClasses = {},
  } = panelWidgetParams || {};

  warning(
    typeof hidden === 'function',
    `The \`hidden\` option in the "panel" widget expects a function returning a boolean (received type ${getObjectType(
      hidden
    )}).`
  );

  warning(
    typeof collapsed === 'undefined' || typeof collapsed === 'function',
    `The \`collapsed\` option in the "panel" widget expects a function returning a boolean (received type ${getObjectType(
      collapsed
    )}).`
  );

  const bodyContainerNode = document.createElement('div');
  const collapsible = Boolean(collapsed);
  const collapsedFn = typeof collapsed === 'function' ? collapsed : () => false;
  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    collapsibleRoot: cx(
      suit({ modifierName: 'collapsible' }),
      userCssClasses.collapsibleRoot
    ),
    collapsedRoot: cx(
      suit({ modifierName: 'collapsed' }),
      userCssClasses.collapsedRoot
    ),
    collapseButton: cx(
      suit({ descendantName: 'collapseButton' }),
      userCssClasses.collapseButton
    ),
    collapseIcon: cx(
      suit({ descendantName: 'collapseIcon' }),
      userCssClasses.collapseIcon
    ),
    body: cx(suit({ descendantName: 'body' }), userCssClasses.body),
    header: cx(suit({ descendantName: 'header' }), userCssClasses.header),
    footer: cx(suit({ descendantName: 'footer' }), userCssClasses.footer),
  };

  return widgetFactory => widgetParams => {
    if (!(widgetParams && widgetParams.container)) {
      throw new Error(
        withUsage(
          `The \`container\` option is required in the widget within the panel.`
        )
      );
    }

    const containerNode = getContainerNode(widgetParams.container);

    const defaultTemplates = {
      header: '',
      footer: '',
      collapseButtonText: ({ collapsed: isCollapsed }) =>
        `<svg
          class="${cssClasses.collapseIcon}"
          width="1em"
          height="1em"
          viewBox="0 0 500 500"
        >
        <path d="${
          isCollapsed ? 'M100 250l300-150v300z' : 'M250 400l150-300H100z'
        }" fill="currentColor" />
        </svg>`,
    };

    const renderPanel = renderer<typeof widgetFactory>({
      containerNode,
      bodyContainerNode,
      cssClasses,
      templates: {
        ...defaultTemplates,
        ...templates,
      },
    });

    renderPanel({
      options: {},
      hidden: true,
      collapsible,
      collapsed: false,
    });

    const widget = widgetFactory({
      ...widgetParams,
      container: bodyContainerNode,
    });

    // TypeScript somehow loses track of the ...widget type, since it's
    // not directly returned. Eventually the "as ReturnType<typeof widgetFactory>"
    // will not be needed anymore.
    // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    return {
      ...widget,
      dispose(...args) {
        render(null, containerNode);

        if (typeof widget.dispose === 'function') {
          return widget.dispose.call(this, ...args);
        }

        return undefined;
      },
      render(...args) {
        const [renderOptions] = args;

        const options = {
          ...((widget.getWidgetRenderState
            ? widget.getWidgetRenderState(renderOptions)
            : {}) as GetWidgetRenderState<typeof widgetFactory>),
          ...renderOptions,
        };

        renderPanel({
          options,
          hidden: Boolean(hidden(options)),
          collapsible,
          collapsed: Boolean(collapsedFn(options)),
        });

        if (typeof widget.render === 'function') {
          widget.render.call(this, ...args);
        }
      },
    } as ReturnType<typeof widgetFactory>;
  };
};

export default panel;
