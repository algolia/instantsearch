import React from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

const Panel = ({ cssClasses, hidden, templateProps, data, onRef }) => (
  <div
    className={cx(cssClasses.root, {
      [cssClasses.noRefinementRoot]: hidden,
    })}
    hidden={hidden}
  >
    {templateProps.templates.header && (
      <Template
        {...templateProps}
        templateKey="header"
        rootProps={{
          className: cssClasses.header,
        }}
        data={data}
      />
    )}

    <div className={cssClasses.body} ref={onRef} />

    {templateProps.templates.footer && (
      <Template
        {...templateProps}
        templateKey="footer"
        rootProps={{
          className: cssClasses.footer,
        }}
        data={data}
      />
    )}
  </div>
);

Panel.propTypes = {
  // Prop to get the panel body reference to insert the widget
  onRef: PropTypes.func,
  cssClasses: PropTypes.shape({
    root: PropTypes.string.isRequired,
    noRefinementRoot: PropTypes.string.isRequired,
    body: PropTypes.string.isRequired,
    header: PropTypes.string.isRequired,
    footer: PropTypes.string.isRequired,
  }).isRequired,
  templateProps: PropTypes.shape({
    templates: PropTypes.object.isRequired,
  }).isRequired,
  hidden: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
};

export default Panel;
