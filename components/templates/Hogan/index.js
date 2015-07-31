'use strict';

var React = require('react');

var hogan = require('hogan.js');

var HoganResult = React.createClass({
  propTypes: {
    template: React.PropTypes.string,
    data: React.PropTypes.object
  },
  componentWillMount: function() {
    this.setState({
      template: hogan.compile(this.props.template)
    });
  },
  render: function() {
    var content = this.state.template.render(this.props.data);
    return <div className="hit" dangerouslySetInnerHTML={{__html: content}} />;
  }
});

module.exports = HoganResult;
