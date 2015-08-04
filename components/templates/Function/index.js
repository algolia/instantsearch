var React = require('react');

var TemplateFn = React.createClass({
  propTypes: {
    template: React.PropTypes.string,
    data: React.PropTypes.object
  },
  render: function() {
    var content = this.props.template(this.props.data);
    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
});

module.exports = TemplateFn;
