import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import Template from '../Template/Template';

class Panel extends Component {
  componentDidMount() {
    this.bodyRef.appendChild(this.props.bodyElement);
  }

  render() {
    const { cssClasses, hidden, templateProps, data } = this.props;

    return (
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

        <div className={cssClasses.body} ref={node => (this.bodyRef = node)} />

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
  }
}

Panel.propTypes = {
  bodyElement: PropTypes.instanceOf(Element).isRequired,
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
