import React, {PropTypes, Component} from 'react';
import {has} from 'lodash';

export default class Select extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    onSelect: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]).isRequired,

      key: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.number,
      ]),
      label: PropTypes.string,
      disabled: PropTypes.bool,
    })).isRequired,
    selectedItem: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
    ]).isRequired,
  };

  onChange = e => {
    this.props.onSelect(e.target.value);
  }

  render() {
    const {applyTheme, items, selectedItem} = this.props;

    return (
      <select
        {...applyTheme('root', 'root')}
        value={selectedItem}
        onChange={this.onChange}
      >
        {items.map(item =>
          <option
            key={has(item, 'key') ? item.key : item.value}
            disabled={item.disabled}
            value={item.value}
          >
            {has(item, 'label') ? item.label : item.value}
          </option>
        )}
      </select>
    );
  }
}
