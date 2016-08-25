import React, {PropTypes, Component} from 'react';

import themeable from '../../core/themeable';

import LinkList from '../../components/LinkList';

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
        }))}
        selectedItem={selectedIndex}
        onSelect={refine}
        createURL={createURL}
      />
    );
  }
}

export default themeable({
  root: 'SortByLinks',
  item: 'SortByLinks__item',
  itemLink: 'SortByLinks__item__link',
  itemSelected: 'SortByLinks__item--selected',
})(SortByLinks);
