var React = require('react');


class IndexSelector extends React.Component {
  handleChange(event) {
    this.props.setIndex(event.target.value);
  }

  render() {
    var {currentIndex, indices} = this.props;

    var handleChange = this.handleChange.bind(this);

    return (
      <select
        className={this.props.cssClasses.root}
        onChange={handleChange}
        value={currentIndex}
      >
        {indices.map((index) => {
          return <option className={this.props.cssClasses.item} key={index.name} value={index.name}>{index.label}</option>;
        })}
      </select>
    );
  }
}

IndexSelector.propTypes = {
  cssClasses: React.PropTypes.shape({
    root: React.PropTypes.string,
    item: React.PropTypes.string
  }),
  currentIndex: React.PropTypes.string,
  indices: React.PropTypes.array,
  setIndex: React.PropTypes.func.isRequired
};

module.exports = IndexSelector;
