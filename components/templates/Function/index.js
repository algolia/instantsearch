'use strict';

var React = require('react');

var TemplateFn = React.createClass({
  render: function() {
    var content = this.props.template(this.props.data);
    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
});

module.exports = TemplateFn;
