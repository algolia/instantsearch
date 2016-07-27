import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {
  hierarchicalItemPropType,
  hierarchicalItemsPropType,
  selectedItemsPropType,
} from '../propTypes';
import MenuLink from './MenuLink';

//
// const defaultTranslations = {
//   showMore: extended => extended ? 'Show less' : 'Show more',
// };

const defaultTheme = {
  root: 'HierarchicalMenu',
  list: 'HierarchicalMenu__list',
  item: 'HierarchicalMenu__item',
  itemSelected: 'HierarchicalMenu__item--selected',
  itemSelectedParent: 'HierarchicalMenu__item--selectedParent',
  itemLink: 'HierarchicalMenu__item__link',
  itemValue: 'HierarchicalMenu__item__value',
  itemCount: 'HierarchicalMenu__item__count',
  showMore: 'HierarchicalMenu__showMore',
};

class HierarchicalMenuItem extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    // translations: PropTypes.object,
    item: hierarchicalItemPropType.isRequired,
    selectedItems: selectedItemsPropType.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
  };

  // We could have only one onClick method since MenuLink passes its onClick
  // handler the item that was provided as props, but having it here might make
  // more sense since we also use createURL the same way in the same component.
  onClick = item => {
    this.props.refine(item.value);
  };

  render() {
    const {
      item,
      selectedItems,
      refine,
      createURL,
      theme,
    } = this.props;

    const th = themeable(theme);

    return (
      <li
        {...th(
          'item',
          'item',
          selectedItems.indexOf(item.value) !== -1 && 'itemSelected',
          item.children && 'itemSelectedParent'
        )}
      >
        <MenuLink
          theme={{
            root: theme.itemLink,
            value: theme.itemValue,
            count: theme.itemCount,
          }}
          item={item}
          href={createURL(item.value)}
          onClick={this.onClick}
        />

        {item.children &&
          <HierarchicalMenuList
            theme={theme}
            refine={refine}
            createURL={createURL}
            items={item.children}
            selectedItems={selectedItems}
          />
        }
      </li>
    );
  }
}

class HierarchicalMenuList extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    // translations: PropTypes.object,
    items: hierarchicalItemsPropType.isRequired,
    selectedItems: selectedItemsPropType.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
  };

  render() {
    const {
      items,
      selectedItems,
      refine,
      createURL,
      theme,
    } = this.props;

    const th = themeable(theme);

    return (
      <ul {...th('list', 'list')}>
        {items.map(item =>
          <HierarchicalMenuItem
            key={item.value}
            theme={theme}
            refine={refine}
            createURL={createURL}
            item={item}
            selectedItems={selectedItems}
          />
        )}
      </ul>
    );
  }
}

class HierarchicalMenu extends Component {
  static propTypes = {
    theme: PropTypes.object,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: hierarchicalItemsPropType,
    selectedItems: selectedItemsPropType,
  };

  static defaultProps = {
    theme: defaultTheme,
  };

  render() {
    const {items, selectedItems, createURL, refine, theme} = this.props;
    if (!items) {
      return null;
    }

    const th = themeable(theme);

    return (
      <div {...th('root', 'root')}>
        <HierarchicalMenuList
          theme={theme}
          items={items}
          selectedItems={selectedItems}
          refine={refine}
          createURL={createURL}
        />
      </div>
    );
  }
}

export default HierarchicalMenu;
