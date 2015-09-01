var hogan = require('hogan.js');
var React = require('react');

class Template {
  render() {
    var content;

    if (typeof this.props.template === 'string') {
      content = hogan.compile(this.props.template).render(this.props.data);
    } else {
      content = this.props.template(this.props.data);
    }

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
