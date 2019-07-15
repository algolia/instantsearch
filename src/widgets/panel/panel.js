import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import {
  getContainerNode,
  prepareTemplateProps,
  warning,
  createDocumentationMessageGenerator,
} from '../../lib/utils';
import { component } from '../../lib/suit';
import Panel from '../../components/Panel/Panel';

const withUsage = createDocumentationMessageGenerator({ name: 'panel' });
const suit = component('Panel');

const renderer = ({
  containerNode,
  bodyContainerNode,
  cssClasses,
  templateProps,
}) => ({ options, hidden, collapsible, collapsed }) => {
  render(
    <Panel
      cssClasses={cssClasses}
      hidden={hidden}
      collapsible={collapsible}
      collapsed={collapsed}
      templateProps={templateProps}
      data={options}
      bodyElement={bodyContainerNode}
    />,
    containerNode
  );
};

/**
 * @typedef {Object} PanelWidgetCSSClasses
 * @property  {string|string[]} [root] CSS classes added to the root element of the widget.
 * @property  {string|string[]} [noRefinementRoot] CSS classes added to the root element of the widget when there's no refinements.
 * @property  {string|string[]} [collapsibleRoot] CSS classes added to the root element when collapsible.
 * @property  {string|string[]} [collapsedRoot] CSS classes added to the root element when collapsed.
 * @property  {string|string[]} [collapseButton] CSS classes added to the collapse button element.
 * @property  {string|string[]} [collapseIcon] CSS classes added to the collapse icon of the button.
 * @property  {string|string[]} [header] CSS class to add to the header.
 * @property  {string|string[]} [footer] CSS class to add to the SVG footer.
 */

/**
 * @typedef {Object} PanelTemplates
 * @property {string|function} [header = ''] Template to use for the header.
 * @property {string|function} [footer = ''] Template to use for the footer.
 * @property {string|function} [collapseButtonText] Template to use for collapse button. It is given the collapsed state.
 */

/**
 * @typedef {Object} PanelWidgetOptions
 * @property {function} [hidden] This function is called on each render to determine from the render options if the panel have to be hidden or not. If the value is `true` the CSS class `noRefinementRoot` is applied and the wrapper is hidden.
 * @property {PanelTemplates} [templates] Templates to use for the widgets.
 * @property {PanelWidgetCSSClasses} [cssClasses] CSS classes to add.
 */

/**
 * The panel widget wraps other widgets in a consistent panel design. It also reacts, indicates and sets CSS classes when widgets are no more relevant for refining.
 *
 * @type {WidgetFactory}
 * @devNovel Panel
 * @category metadata
 * @param {PanelWidgetOptions} $0 Panel widget options.
 * @return {function} A new panel widget instance
 * @example
 * const refinementListWithPanel = instantsearch.widgets.panel({
 *   templates: {
 *     header: 'Brand',
 *   },
 * })(instantsearch.widgets.refinementList);
 *
 * search.addWidget(
 *   refinementListWithPanel({
 *     container: '#refinement-list',
 *     attribute: 'brand',
 *   })
 * );
 */
export default function panel({
  templates = {},
  hidden = () => false,
  collapsed,
  cssClasses: userCssClasses = {},
} = {}) {
  warning(
    typeof hidden === 'function',
    `The \`hidden\` option in the "panel" widget expects a function returning a boolean (received "${typeof hidden}" type).`
  );

  warning(
    typeof collapsed === 'undefined' || typeof collapsed === 'function',
    `The \`collapsed\` option in the "panel" widget expects a function returning a boolean (received "${typeof collapsed}" type).`
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

  return widgetFactory => (widgetOptions = {}) => {
    const { container } = widgetOptions;

    if (!container) {
      throw new Error(
        withUsage(
          `The \`container\` option is required in the widget within the panel.`
        )
      );
    }

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
    const templateProps = prepareTemplateProps({ defaultTemplates, templates });

    const renderPanel = renderer({
      containerNode: getContainerNode(container),
      bodyContainerNode,
      cssClasses,
      templateProps,
    });

    renderPanel({
      options: {},
      hidden: true,
      collapsible,
      collapsed: false,
    });

    const widget = widgetFactory({
      ...widgetOptions,
      container: bodyContainerNode,
    });

    return {
      ...widget,
      dispose(...args) {
        unmountComponentAtNode(getContainerNode(container));

        if (typeof widget.dispose === 'function') {
          return widget.dispose.call(this, ...args);
        }

        return undefined;
      },
      render(...args) {
        const [options] = args;

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
    };
  };
}
