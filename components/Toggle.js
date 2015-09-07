var React = require('react');

class Toggle extends React.Component {
  render() {
    var toggleFilter = this.props.toggleFilter;
    var label = this.props.label;
    var isRefined = this.props.isRefined;

    return (
      <label>
        <input
          checked={isRefined}
          onChange={toggleFilter}
          type="checkbox"
        />
        {label}
      </label>
    );
  }
}

Toggle.propTypes = {
  toggleFilter: React.PropTypes.func,
  label: React.PropTypes.string,
  isRefined: React.PropTypes.bool
};

module.exports = Toggle;
