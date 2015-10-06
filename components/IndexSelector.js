var React = require('react');

var bem = require('../lib/utils').bemHelper('ais-index-selector');
var cx = require('classnames');

class IndexSelector extends React.Component {
  handleChange(event) {
    this.props.setIndex(event.target.value);
  }

  render() {
    var {currentIndex, indices} = this.props;

    var selectClass = cx(bem('select'), this.props.cssClasses.select);
    var optionClass = cx(bem('option'), this.props.cssClasses.option);

    var handleChange = this.handleChange.bind(this);

    return (
      <select
        className={selectClass}
        onChange={handleChange}
        value={currentIndex}
      >
          {indices.map(function(index) {
            return <option className={optionClass} key={index.name} value={index.name}>{index.label}</option>;
          })}
      </select>
    );
  }
}

IndexSelector.propTypes = {
  cssClasses: React.PropTypes.shape({
    select: React.PropTypes.string,
    option: React.PropTypes.string
  }),
  currentIndex: React.PropTypes.string,
  indices: React.PropTypes.array,
  setIndex: React.PropTypes.func.isRequired
};

module.exports = IndexSelector;
