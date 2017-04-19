import React, {PropTypes, Component} from 'react';

import createFacetRefiner from '../createFacetRefiner';
import {itemsPropType, selectedItemsPropType} from '../propTypes';

import MenuLink from './MenuLink';

class RefinementList extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  onItemClick = item => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(item.value);
    if (idx === -1) {
      nextSelectedItems.push(item.value);
    } else {
      nextSelectedItems.splice(idx, 1);
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
            <MenuLink
              onClick={this.onItemClick}
              item={item}
              selected={selectedItems.indexOf(item.value) !== -1}
            />
          </li>
        )}
      </ul>
    );
  }
}

export default createFacetRefiner(RefinementList);
