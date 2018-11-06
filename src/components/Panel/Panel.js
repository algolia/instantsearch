import React from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

const Panel = ({ cssClasses, hidden, templateProps, data, setBodyRef }) => (
  <div
    className={cx(cssClasses.root, {
      [cssClasses.noRefinementRoot]: !data.canRefine,
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

    <div className={cssClasses.body} ref={setBodyRef} />

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
  setBodyRef: PropTypes.func,
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
  data: PropTypes.shape({
    canRefine: PropTypes.bool.isRequired,
  }).isRequired,
};

export default Panel;
