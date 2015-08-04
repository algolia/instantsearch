var hogan = require('hogan.js');
var React = require('react');

var HoganResult = React.createClass({
  propTypes: {
    template: React.PropTypes.string,
    data: React.PropTypes.object
  },
  render: function() {
    var content = hogan.compile(this.props.template).render(this.props.data);
    return <div className="hit" dangerouslySetInnerHTML={{__html: content}} />;
  }
});

module.exports = HoganResult;
