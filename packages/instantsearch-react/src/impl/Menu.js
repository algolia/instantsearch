import React, {PropTypes, Component} from 'react';

import createFacetRefiner from '../createFacetRefiner';
import {itemsPropType, selectedItemsPropType} from '../propTypes';

class Menu extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  render() {
    const {items, selectedItems, refine} = this.props;
    if (!items) {
      return null;
    }

    return (
      <ul>
        {items.map(item => {
          const selected = selectedItems.indexOf(item.value) !== -1;
          return (
            <li
              key={item.value}
              onClick={
                refine.bind(
                  null,
                  selected ? [] : [item.value]
                )
              }
              style={{
                fontWeight: selected ? 'bold' : null,
              }}
            >
              {item.value} {item.count}
            </li>
          );
        })}
      </ul>
    );
  }
}

export default createFacetRefiner(Menu);
