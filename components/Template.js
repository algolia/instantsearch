var React = require('react');

var renderTemplate = require('../lib/utils').renderTemplate;

class Template {
  render() {
    var content = renderTemplate({
      template: this.props.template,
      templateHelpers: this.props.templateHelpers,
      data: this.props.transformData ? this.props.transformData(this.props.data) : this.props.data
    });

    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
}

Template.propTypes = {
  template: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.func
  ]).isRequired,
  templateHelpers: React.PropTypes.object,
  transformData: React.PropTypes.func,
  data: React.PropTypes.object
};

Template.defaultProps = {
  data: {},
  template: ''
};

module.exports = Template;
