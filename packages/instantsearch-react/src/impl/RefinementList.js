import React, {PropTypes, Component} from 'react';

import {itemsPropType, selectedItemsPropType} from '../propTypes';

import RefinementListCheckboxItem from './RefinementListCheckboxItem';

class RefinementList extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  onItemChange = (item, selected) => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    if (selected) {
      nextSelectedItems.push(item.value);
    } else {
      nextSelectedItems.splice(nextSelectedItems.indexOf(item.value), 1);
    }
    this.props.refine(nextSelectedItems);
  }

  render() {
    const {items, selectedItems} = this.props;
    if (!items) {
      return null;
    }

    return (
      <ul>
        {items.map(item =>
          <li key={item.value}>
            <RefinementListCheckboxItem
              onChange={this.onItemChange}
              item={item}
              selected={selectedItems.indexOf(item.value) !== -1}
            />
          </li>
        )}
      </ul>
    );
  }
}

export default RefinementList;
