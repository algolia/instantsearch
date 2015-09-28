var React = require('react');

var cx = require('classnames');

var identity = require('lodash/utility/identity');

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    render() {
      return (
        <div className={cx(this.props.cssClasses.root)}>
          <this.props.Template templateKey="header" transformData={identity} />
          <ComposedComponent {...this.props} />
          <this.props.Template templateKey="footer" transformData={identity} />
        </div>
      );
    }
  }

  HeaderFooter.propTypes = {
    templates: React.PropTypes.shape({
      header: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.func
      ]),
      footer: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.func
      ])
    }),
    defaultTemplates: React.PropTypes.shape({
      header: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.func
      ]),
      footer: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.func
      ])
    }),
    templatesConfig: React.PropTypes.object.isRequired,
    cssClasses: React.PropTypes.shape({
      root: React.PropTypes.oneOfType([
        React.PropTypes.string,
        React.PropTypes.arrayOf(React.PropTypes.string)
      ])
    })
  };

  HeaderFooter.defaultProps = {
    defaultTemplates: {
      header: '',
      footer: ''
    },
    cssClasses: {
      root: null
    }
  };

  // precise displayName for ease of debugging (react dev tool, react warnings)
  HeaderFooter.displayName = ComposedComponent.name + '-HeaderFooter';

  return HeaderFooter;
}

module.exports = headerFooter;
