// Issue with eslint + high-order components like decorators
/* eslint react/prop-types: 0 */

var React = require('react');

var cx = require('classnames/dedupe');

var Template = require('../components/Template');

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    render() {
      // override potential widget's defined transformData,
      // header and footer currently do not have it
      var transformData = null;
      var templateProps = this.props.templateProps;
      var classNames = {
        root: this.props.cssClasses.root,
        header: cx(this.props.cssClasses.header, 'ais-header'),
        body: this.props.cssClasses.body,
        footer: cx(this.props.cssClasses.footer, 'ais-footer')
      };

      return (
        <div className={classNames.root}>
          <div className={classNames.header}>
            <Template templateKey="header" {...templateProps} transformData={transformData} />
          </div>
          <div className={classNames.body}>
            <ComposedComponent {...this.props} />
          </div>
          <div className={classNames.footer}>
            <Template templateKey="footer" {...templateProps} transformData={transformData} />
          </div>
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
