import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {
  hierarchicalItemPropType,
  hierarchicalItemsPropType,
  selectedItemsPropType,
} from '../propTypes';
import {getTranslation} from '../utils';

import LinkItem from './LinkItem';

function hasSelectedChild(item, selectedItems) {
  return item.children && item.children.some(child =>
    selectedItems.indexOf(child.value) !== -1 ||
    hasSelectedChild(child, selectedItems)
  );
}

const defaultTranslations = {
  showMore: extended => extended ? 'Show less' : 'Show more',
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
  itemLabel: 'HierarchicalMenu__item__label',
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
    limit: PropTypes.number.isRequired,
  };

  // We could have only one onClick method since LinkItem passes its onClick
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
      limit,
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
        <LinkItem
          {...th('itemLink', 'itemLink')}
          onClick={this.onClick}
          item={item}
          href={createURL(item.value)}
        >
          <span {...th('itemLabel', 'itemLabel')}>
            {item.label}
          </span>
          {' '}
          <span {...th('itemCount', 'itemCount')}>
            {getTranslation(
              'count',
              defaultTranslations,
              translations,
              item.count
            )}
          </span>
        </LinkItem>

        {item.children &&
          <HierarchicalMenuList
            theme={theme}
            translations={translations}
            refine={refine}
            createURL={createURL}
            items={item.children}
            selectedItems={selectedItems}
            limit={limit}
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
    limit: PropTypes.number.isRequired,
  };

  render() {
    const {
      items,
      selectedItems,
      refine,
      createURL,
      theme,
      translations,
      limit,
    } = this.props;

    const th = themeable(theme);

    return (
      <ul {...th('list', 'list')}>
        {items
          .slice(0, limit)
          .map(item =>
            <HierarchicalMenuItem
              key={item.value}
              theme={theme}
              translations={translations}
              refine={refine}
              createURL={createURL}
              item={item}
              selectedItems={selectedItems}
              limit={limit}
            />
          )
        }
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
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    limit: PropTypes.number.isRequired,
    show: PropTypes.func.isRequired,
  };

  static defaultProps = {
    theme: defaultTheme,
    translations: defaultTranslations,
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  };

  onShowMoreClick = () => {
    this.props.show(
      this.props.limit === this.props.limitMax ?
        this.props.limitMin :
        this.props.limitMax
    );
  };

  render() {
    const {
      items,
      selectedItems,
      createURL,
      refine,
      theme,
      translations,
      showMore,
      limit,
      limitMax,
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
          limit={limit}
        />
        {showMore &&
          <button
            {...th('showMore', 'showMore')}
            onClick={this.onShowMoreClick}
          >
            {getTranslation(
              'showMore',
              defaultTranslations,
              translations,
              limit === limitMax
            )}
          </button>
        }
      </div>
    );
  }
}

export default HierarchicalMenu;
