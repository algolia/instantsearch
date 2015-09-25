var React = require('react');

var Template = require('../components/Template');

var cx = require('classnames');

function headerFooter(ComposedComponent) {
  class HeaderFooter extends React.Component {
    render() {
      return (
        <div className={cx(this.props.cssClasses.root)}>
          <Template template={this.props.templates.header} defaultTemplate={this.props.defaultTemplates.header} config={this.props.templatesConfig} />
          <ComposedComponent {...this.props} />
          <Template template={this.props.templates.footer} defaultTemplate={this.props.defaultTemplates.footer} config={this.props.templatesConfig} />
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
