'use strict';

var React = require('react');

var hogan = require('hogan.js');
var memoize = require('lodash/function/memoize');

var memoHogan = memoize(hogan.compile.bind(hogan));

var HoganResult = React.createClass({
  componentWillMount: function() {
    this.setState({
      template: memoHogan(this.props.template)
    });
  },
  render: function() {
    var content = this.state.template.render(this.props.data);
    return <div dangerouslySetInnerHTML={{__html: content}} />;
  }
});

module.exports = HoganResult;
