var React = require('react');

var renderTemplate = require('../lib/utils').renderTemplate;

var identity = require('lodash/utility/identity');

class Template {
  render() {
    var content = renderTemplate({
      template: this.props.templates[this.props.templateKey],
      defaultTemplate: this.props.defaultTemplates[this.props.templateKey],
      config: this.props.templatesConfig,
      data: this.props.transformData(this.props.data)
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
  transformData: React.PropTypes.object,
  data: React.PropTypes.object
};

Template.defaultProps = {
  data: {},
  template: '',
  transformData: identity
};

module.exports = Template;
