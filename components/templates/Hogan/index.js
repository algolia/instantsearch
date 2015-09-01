var hogan = require('hogan.js');
var React = require('react');

class HoganResult {
  render() {
    var content = hogan.compile(this.props.template).render(this.props.data);
    return <div className="hit" dangerouslySetInnerHTML={{__html: content}} />;
  }
}

HoganResult.propTypes = {
  template: React.PropTypes.string,
  data: React.PropTypes.object
};

module.exports = HoganResult;
