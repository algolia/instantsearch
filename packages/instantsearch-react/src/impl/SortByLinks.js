import React, {PropTypes, Component} from 'react';

import themeable from '../themeable';

import LinkList from './LinkList';

class SortByLinks extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      index: PropTypes.string.isRequired,
    })).isRequired,
    selectedIndex: PropTypes.string.isRequired,
  };

  render() {
    const {applyTheme, refine, createURL, items, selectedIndex} = this.props;

    return (
      <LinkList
        applyTheme={applyTheme}
        items={items.map(item => ({
          label: item.label,
          value: item.index,
          href: createURL(item.index),
        }))}
        selectedItem={selectedIndex}
        onItemClick={refine}
      />
    );
  }
}

export default themeable({
  root: 'SortByLinks',
  item: 'SortByLinks__item',
  itemSelected: 'SortByLinks__item--selected',
})(SortByLinks);
