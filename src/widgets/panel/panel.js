import React, { render, unmountComponentAtNode } from 'preact-compat';
import cx from 'classnames';
import { getContainerNode, prepareTemplateProps, warn } from '../../lib/utils';
import { component } from '../../lib/suit';
import Panel from '../../components/Panel/Panel';

const suit = component('Panel');

const renderer = ({ containerNode, cssClasses, templateProps }) => ({
  options,
  hidden,
}) => {
  let bodyRef = null;

  render(
    <Panel
      cssClasses={cssClasses}
      hidden={hidden}
      templateProps={templateProps}
      data={options}
      onRef={ref => (bodyRef = ref)}
    />,
    containerNode
  );

  return { bodyRef };
};

const usage = `Usage:
const widgetWithHeaderFooter = panel({
  [ templates.{header, footer} ],
  [ hidden ],
  [ cssClasses.{root, noRefinementRoot, body, header, footer} ],
})(widget);

const myWidget = widgetWithHeaderFooter(widgetOptions)`;

export default function panel({
  templates = {},
  hidden = () => false,
  cssClasses: userCssClasses = {},
} = {}) {
  if (typeof hidden !== 'function') {
    warn(
      `The \`hidden\` option in the "panel" widget expects a function returning a boolean (received "${typeof hidden}" type).`
    );
  }

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    noRefinementRoot: cx(
      suit({ modifierName: 'noRefinement' }),
      userCssClasses.noRefinementRoot
    ),
    body: cx(suit({ descendantName: 'body' }), userCssClasses.body),
    header: cx(suit({ descendantName: 'header' }), userCssClasses.header),
    footer: cx(suit({ descendantName: 'footer' }), userCssClasses.footer),
  };

  return widgetFactory => (widgetOptions = {}) => {
    const { container } = widgetOptions;

    if (!container) {
      throw new Error(
        `[InstantSearch.js] The \`container\` option is required in the widget within the panel.`
      );
    }

    const defaultTemplates = { header: '', footer: '' };
    const templateProps = prepareTemplateProps({ defaultTemplates, templates });

    const renderPanel = renderer({
      containerNode: getContainerNode(container),
      cssClasses,
      templateProps,
    });

    try {
      const { bodyRef } = renderPanel({
        options: {},
        hidden: true,
      });

      const widget = widgetFactory({
        ...widgetOptions,
        container: getContainerNode(bodyRef),
      });

      return {
        ...widget,
        dispose() {
          unmountComponentAtNode(getContainerNode(container));

          if (typeof widget.dispose === 'function') {
            widget.dispose();
          }
        },
        render(options) {
          renderPanel({
            options,
            hidden: Boolean(hidden(options)),
          });

          if (typeof widget.render === 'function') {
            widget.render(options);
          }
        },
      };
    } catch (error) {
      throw new Error(usage);
    }
  };
}
