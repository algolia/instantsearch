import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {
  hierarchicalItemPropType,
  hierarchicalItemsPropType,
  selectedItemsPropType,
} from '../propTypes';
import MenuLink from './MenuLink';

function hasSelectedChild(item, selectedItems) {
  return item.children && item.children.some(child =>
    selectedItems.indexOf(child.value) !== -1 ||
    hasSelectedChild(child, selectedItems)
  );
}

const defaultTranslations = {
  count: count => count.toString(),
};

const defaultTheme = {
  root: 'HierarchicalMenu',
  list: 'HierarchicalMenu__list',
  item: 'HierarchicalMenu__item',
  itemSelected: 'HierarchicalMenu__item--selected',
  itemParent: 'HierarchicalMenu__item--parent',
  itemSelectedParent: 'HierarchicalMenu__item--selectedParent',
  itemLink: 'HierarchicalMenu__item__link',
  itemValue: 'HierarchicalMenu__item__value',
  itemCount: 'HierarchicalMenu__item__count',
  showMore: 'HierarchicalMenu__showMore',
};

class HierarchicalMenuItem extends Component {
  static propTypes = {
    theme: PropTypes.object.isRequired,
    translations: PropTypes.object.isRequired,
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
      translations,
    } = this.props;

    const th = themeable(theme);

    return (
      <li
        {...th(
          'item',
          'item',
          selectedItems.indexOf(item.value) !== -1 && 'itemSelected',
          item.children && 'itemParent',
          hasSelectedChild(item, selectedItems) && 'itemSelectedParent'
        )}
      >
        <MenuLink
          theme={{
            root: theme.itemLink,
            value: theme.itemValue,
            count: theme.itemCount,
          }}
          translations={translations}
          item={item}
          href={createURL(item.value)}
          onClick={this.onClick}
        />

        {item.children &&
          <HierarchicalMenuList
            theme={theme}
            translations={translations}
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
    translations: PropTypes.object.isRequired,
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
      translations,
    } = this.props;

    const th = themeable(theme);

    return (
      <ul {...th('list', 'list')}>
        {items.map(item =>
          <HierarchicalMenuItem
            key={item.value}
            theme={theme}
            translations={translations}
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
    translations: PropTypes.object,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: hierarchicalItemsPropType,
    selectedItems: selectedItemsPropType,
  };

  static defaultProps = {
    theme: defaultTheme,
    translations: defaultTranslations,
  };

  render() {
    const {
      items,
      selectedItems,
      createURL,
      refine,
      theme,
      translations,
    } = this.props;
    if (!items) {
      return null;
    }

    const th = themeable(theme);

    return (
      <div {...th('root', 'root')}>
        <HierarchicalMenuList
          theme={theme}
          translations={translations}
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
