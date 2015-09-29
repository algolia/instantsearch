var React = require('react');

var cx = require('classnames');

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    render() {
      // override potential widget's defined transformData,
      // header and footer currently do not have it
      var transformData = null;

      return (
        <div className={cx(this.props.cssClasses.root)}>
          <this.props.Template templateKey="header" transformData={transformData} />
          <ComposedComponent {...this.props} />
          <this.props.Template templateKey="footer" transformData={transformData} />
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    cssClasses: React.PropTypes.shape({
      root: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.arrayOf(React.PropTypes.string)
      ])
    })
  };

  HeaderFooter.defaultProps = {
    cssClasses: {
      root: null
    }
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

module.exports = headerFooter;
