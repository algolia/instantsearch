var React = require('react');

class IndexSelector extends React.Component {
  handleChange(event) {
    this.props.setIndex(event.target.value).search();
  }

  render() {
    var currentIndex = this.props.currentIndex;
    var indices = this.props.indices;
    var cssClass = this.props.cssClass;
    var selectId = this.props.containerId + '-select';

    return (
      <select
        id={selectId}
        className={cssClass}
        onChange={this.handleChange.bind(this)}
        value={currentIndex}
      >
          {indices.map(function(index) {
            return <option key={index.name} value={index.name}>{index.label}</option>;
          })}
      </select>
    );
  }
}

IndexSelector.propTypes = {
  containerId: React.PropTypes.string,
  cssClass: React.PropTypes.string,
  currentIndex: React.PropTypes.string,
  indices: React.PropTypes.array,
  setIndex: React.PropTypes.func
};

module.exports = IndexSelector;
