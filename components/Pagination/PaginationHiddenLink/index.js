var React = require('react');

class PaginationHiddenLink extends React.Component {
  render() {
    var liStyle = {visibility: 'hidden'};
    return (
      <li style={liStyle}>
        <span dangerouslySetInnerHTML={{__html: this.props.label}}></span>
      </li>
    );
  }
}

PaginationHiddenLink.propTypes = {
  label: React.PropTypes.oneOfType([
    React.PropTypes.string,
    React.PropTypes.number
  ]).isRequired
};

module.exports = PaginationHiddenLink;
