import React, {PropTypes, Component} from 'react';

import createFacetRefiner from '../createFacetRefiner';
import {itemsPropType, selectedItemsPropType} from '../propTypes';

class RefinementList extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
  };

  onValueClick = value => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(value);
    if (idx === -1) {
      nextSelectedItems.push(value);
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
        {items.map(item => {
          const selected = selectedItems.indexOf(item.value) !== -1;
          return (
            <li
              key={item.value}
              onClick={this.onValueClick.bind(null, item.value)}
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

export default createFacetRefiner(RefinementList);
