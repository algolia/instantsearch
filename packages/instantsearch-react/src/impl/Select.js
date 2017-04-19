import React, {PropTypes, Component} from 'react';

import {itemsPropType, selectedItemsPropType} from '../propTypes';

class Select extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  onChange = e => {
    this.props.refine([e.target.value]);
  }

  render() {
    const {items, selectedItems} = this.props;
    if (!items) {
      return null;
    }

    const selectedItem = selectedItems[0];

    return (
      <select value={selectedItem} onChange={this.onChange}>
        {items.map(item =>
          <option key={item.value} value={item.value}>
            {item.value} {item.count}
          </option>
        )}
      </select>
    );
  }
}

export default Select;
