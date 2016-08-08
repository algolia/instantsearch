import React, {PropTypes, Component} from 'react';

export default class Select extends Component {
  static propTypes = {
    onChange: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,
    })).isRequired,
    selectedItem: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  };

  onChange = e => {
    this.props.onChange(e.target.value);
  }

  render() {
    const {items, selectedItem, ...otherProps} = this.props;

    return (
      <select
        {...otherProps}
        value={selectedItem}
        onChange={this.onChange}
      >
        {items.map(item =>
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        )}
      </select>
    );
  }
}
