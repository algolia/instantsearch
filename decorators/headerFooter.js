// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

let React = require('react');

let cx = require('classnames');

let Template = require('../components/Template');

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    getTemplate(type) {
      let templates = this.props.templateProps.templates;
      if (!templates || !templates[type]) {
        return null;
      }
      let className = cx(this.props.cssClasses[type], `ais-${type}`);
      return (
        <Template {...this.props.templateProps}
          cssClass={className}
          templateKey={type}
          transformData={null}
        />
      );
    }
    render() {
      let classNames = {
        root: cx(this.props.cssClasses.root),
        body: cx(this.props.cssClasses.body)
      };

      // Only add header/footer if a template is defined
      let header = this.getTemplate('header');
      let footer = this.getTemplate('footer');

      return (
        <div className={classNames.root}>
          {header}
          <div className={classNames.body}>
            <ComposedComponent {...this.props} />
          </div>
          {footer}
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    cssClasses: React.PropTypes.shape({
      root: React.PropTypes.string,
      header: React.PropTypes.string,
      body: React.PropTypes.string,
      footer: React.PropTypes.string
    }),
    templateProps: React.PropTypes.object
  };

  HeaderFooter.defaultProps = {
    cssClasses: {}
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

module.exports = headerFooter;
