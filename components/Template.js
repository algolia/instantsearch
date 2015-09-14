var React = require('react');

var renderTemplate = require('../lib/utils').renderTemplate;

class Template {
  render() {
    var content = renderTemplate(this.props.template, this.props.data);

    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
}

Template.propTypes = {
  template: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  data: React.PropTypes.object
};

module.exports = Template;
