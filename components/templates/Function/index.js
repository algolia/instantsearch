var React = require('react');

class TemplateFn {
  render() {
    var content = this.props.template(this.props.data);
    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
}

TemplateFn.propTypes = {
  template: React.PropTypes.string,
  data: React.PropTypes.object
};

module.exports = TemplateFn;
