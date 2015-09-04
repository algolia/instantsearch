var React = require('react');

class IndexSelector extends React.Component {
  handleChange(event) {
    this.props.setIndex(event.target.value).search();
  }

  render() {
    var currentIndex = this.props.currentIndex;
    var indices = this.props.indices;

    return (
      <select onChange={this.handleChange.bind(this)} value={currentIndex}>
        {indices.map(function(index) {
          return <option key={index.name} value={index.name}>{index.label}</option>;
        })}
      </select>
    );
  }
}

IndexSelector.propTypes = {
  currentIndex: React.PropTypes.string,
  indices: React.PropTypes.array,
  setIndex: React.PropTypes.func
};

module.exports = IndexSelector;
