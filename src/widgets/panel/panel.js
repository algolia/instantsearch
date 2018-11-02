import React, { render, unmountComponentAtNode } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { getContainerNode, prepareTemplateProps } from '../../lib/utils';
import { component } from '../../lib/suit';
import Template from '../../components/Template/Template';

const suit = component('Panel');

const renderer = ({ containerNode, cssClasses, templates, templateProps }) => ({
  results,
} = {}) => {
  let bodyReference = null;

  render(
    <div className={cssClasses.root}>
      {templates.header && (
        <Template
          {...templateProps}
          templateKey="header"
          rootProps={{
            className: cssClasses.header,
          }}
          data={{ results }}
        />
      )}
      <div className={cssClasses.body} ref={ref => (bodyReference = ref)} />
      {templates.footer && (
        <Template
          {...templateProps}
          templateKey="footer"
          rootProps={{
            className: cssClasses.footer,
          }}
          data={{ results }}
        />
      )}
    </div>,
    containerNode
  );

  return { bodyReference };
};

renderer.propTypes = {
  templates: PropTypes.object.isRequired,
  templateProps: PropTypes.object.isRequired,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    noRefinementRoot: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
  }).isRequired,
};

const usage = `Usage:
const widgetWithHeaderFooter = panel({
  container,
  [ cssClasses.{root, noRefinementRoot, body, header, footer} ],
  [ templates.{header, footer} ],
})(widget);

const myWidget = widgetWithHeaderFooter(widgetOptions)`;

export default function panel({
  templates,
  cssClasses: userCssClasses = {},
} = {}) {
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

  return widgetFactory => widgetOptions => {
    const { container } = widgetOptions;

    if (!container) {
      throw new Error(
        `[InstantSearch.js] The widget "${
          widgetFactory.name
        }" is missing a container option.`
      );
    }

    const defaultTemplates = { header: '', footer: '' };
    const templateProps = prepareTemplateProps({ defaultTemplates, templates });

    const specializedRenderer = renderer({
      containerNode: getContainerNode(container),
      cssClasses,
      templates,
      templateProps,
    });

    try {
      const { bodyReference } = specializedRenderer();

      const widget = widgetFactory({
        ...widgetOptions,
        container: getContainerNode(bodyReference),
      });

      return {
        ...widget,
        dispose() {
          unmountComponentAtNode(getContainerNode(container));
          widget.dispose();
        },
        render(options) {
          specializedRenderer({
            results: options.results,
          });
          widget.render(options);
        },
      };
    } catch (error) {
      throw new Error(usage);
    }
  };
}
