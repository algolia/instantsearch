import React, {PropTypes, Component} from 'react';

class SortBy extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      index: PropTypes.string.isRequired,
    })).isRequired,
    selectedIndex: PropTypes.string.isRequired,
  };

  onChange = e => {
    this.props.refine(e.target.value);
  }

  render() {
    const {items, selectedIndex} = this.props;

    return (
      <select value={selectedIndex} onChange={this.onChange}>
        {items.map(item =>
          <option key={item.index} value={item.index}>
            {item.label}
          </option>
        )}
      </select>
    );
  }
}

export default SortBy;
