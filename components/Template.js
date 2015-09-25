var React = require('react');

var renderTemplate = require('../lib/utils').renderTemplate;

class Template {
  render() {
    var content = renderTemplate({
      template: this.props.template,
      defaultTemplate: this.props.defaultTemplate,
      config: this.props.config,
      data: this.props.transformData ? this.props.transformData(this.props.data) : this.props.data
    });

    if (content === null) {
      // Adds a noscript to the DOM but virtual DOM is null
      // See http://facebook.github.io/react/docs/component-specs.html#render
      return null;
    }

    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
}

Template.propTypes = {
  template: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]),
  defaultTemplate: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]),
  config: React.PropTypes.object.isRequired,
  transformData: React.PropTypes.func,
  data: React.PropTypes.object
};

Template.defaultProps = {
  data: {},
  template: ''
};

module.exports = Template;
