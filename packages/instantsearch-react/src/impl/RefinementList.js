import React, {PropTypes, Component} from 'react';
import themeable from 'react-themeable';

import {itemsPropType, selectedItemsPropType} from '../propTypes';
import {getTranslation} from '../utils';

const defaultTranslations = {
  showMore: extended => extended ? 'Show less' : 'Show more',
  count: count => count.toString(),
};

const defaultTheme = {
  root: 'RefinementList',
  list: 'RefinementList__list',
  item: 'RefinementList__item',
  itemSelected: 'RefinementList__item--selected',
  itemLink: 'RefinementList__item__link',
  itemValue: 'RefinementList__item__value',
  itemCount: 'RefinementList__item__count',
};

class RefinementList extends Component {
  static propTypes = {
    theme: PropTypes.object,
    translations: PropTypes.object,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: selectedItemsPropType,
    showEmpty: PropTypes.bool,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
    limit: PropTypes.number.isRequired,
    show: PropTypes.func.isRequired,
  };

  static defaultProps = {
    theme: defaultTheme,
    translations: defaultTranslations,
    showEmpty: true,
    items: [],
    showMore: false,
    limitMin: 10,
    limitMax: 20,
  };

  onItemChange = (item, e) => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(item.value);
    if (e.target.checked && idx === -1) {
      nextSelectedItems.push(item.value);
    } else if (!e.target.checked && idx !== -1){
      nextSelectedItems.splice(idx, 1);
    }
    this.props.refine(nextSelectedItems);
  }

  onShowMoreClick = () => {
    this.props.show(
      this.props.limit === this.props.limitMax ?
        this.props.limitMin :
        this.props.limitMax
    );
  };

  renderItem = item => {
    const {selectedItems, translations, theme} = this.props;
    const selected = selectedItems.indexOf(item.value) !== -1;

    const th = themeable(theme);

    return (
      <li
        {...th(
          item.value,
          'item',
          selected && 'itemSelected'
        )}
      >
        <label>
          <input
            {...th('itemCheckbox', 'itemCheckbox')}
            type="checkbox"
            checked={selected}
            onChange={this.onItemChange.bind(null, item)}
          />
          <span {...th('itemLabel', 'itemLabel')}>
            {item.value}
          </span>
          {' '}
          <span {...th('itemCount', 'itemCount')}>
            {getTranslation(
              'count',
              {},
              translations,
              item.count
            )}
          </span>
        </label>
      </li>
    );
  };

  renderShowMore() {
    const {translations, limit, limitMax, showMore, theme} = this.props;

    if (!showMore) {
      return null;
    }

    const th = themeable(theme);

    return (
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
    );
  }

  render() {
    const {
      theme,
      items,
      selectedItems,
      showEmpty,
      limit,
    } = this.props;
    if (items.length === 0 && !(showEmpty && selectedItems.length > 0)) {
      return null;
    }

    const th = themeable(theme);

    const allItems = showEmpty ? items.concat(
      selectedItems
        .filter(value =>
          !items.some(item => item.value === value)
        )
        .map(value => ({value, count: 0}))
    ) : items;

    return (
      <div {...th('root', 'root')}>
        <ul {...th('list', 'list')}>
          {allItems.slice(0, limit).map(this.renderItem)}
        </ul>
        {this.renderShowMore()}
      </div>
    );
  }
}

export default RefinementList;
