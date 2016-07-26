import React, {PropTypes, Component} from 'react';

import {hierarchicalItemsPropType, selectedItemsPropType} from '../propTypes';

class HierarchicalMenu extends Component {
  static propTypes = {
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: hierarchicalItemsPropType,
    selectedItems: selectedItemsPropType,
  };

  render() {
    const {items, selectedItems, refine, createURL} = this.props;
    if (!items) {
      return null;
    }

    return (
      <ul>
        {items.map(item =>
          <li key={item.value}>
            <a
              href={createURL(item.value)}
              onClick={e => {
                refine(item.value);
                e.preventDefault();
              }}
              style={{
                fontWeight:
                  selectedItems.indexOf(item.value) !== -1 || item.children ?
                    'bold' :
                    'normal',
              }}
            >
              {item.label || item.value} {item.count}
            </a>

            {item.children &&
              <HierarchicalMenu
                refine={refine}
                createURL={createURL}
                items={item.children}
                selectedItems={selectedItems}
              />
            }
          </li>
        )}
      </ul>
    );
  }
}

export default HierarchicalMenu;
