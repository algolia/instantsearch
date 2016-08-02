import React, {PropTypes, Component} from 'react';
import pick from 'lodash/object/pick';

import themeable from '../themeable';
import translatable from '../translatable';

import List from './List';
import LinkItem from './LinkItem';

class RefinementListLinks extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })),
    selectedItems: PropTypes.arrayOf(PropTypes.string),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  getSelectedItems = item => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(item.value);
    if (idx === -1) {
      nextSelectedItems.push(item.value);
    } else {
      nextSelectedItems.splice(idx, 1);
    }
    return nextSelectedItems;
  };

  onItemClick = item => {
    this.props.refine(this.getSelectedItems(item));
  }

  renderItem = item => {
    const {createURL, applyTheme, translate} = this.props;

    return (
      <LinkItem
        {...applyTheme('itemLink', 'itemLink')}
        onClick={this.onItemClick}
        item={item}
        href={createURL(this.getSelectedItems(item))}
      >
        <span {...applyTheme('itemLabel', 'itemLabel')}>
          {item.value}
        </span>
        {' '}
        <span {...applyTheme('itemCount', 'itemCount')}>
          {translate('count', item.count)}
        </span>
      </LinkItem>
    );
  }

  render() {
    return (
      <List
        renderItem={this.renderItem}
        {...pick(this.props, [
          'applyTheme',
          'translate',
          'items',
          'selectedItems',
          'showMore',
          'limitMin',
          'limitMax',
        ])}
      />
    );
  }
}

export default themeable({
  root: 'RefinementListLinks',
  items: 'RefinementListLinks__items',
  item: 'RefinementListLinks__item',
  itemSelected: 'RefinementListLinks__item--selected',
  itemLink: 'RefinementListLinks__item__link',
  itemLabel: 'RefinementListLinks__item__label',
  itemCount: 'RefinementListLinks__item__count',
})(
  translatable({
    showMore: extended => extended ? 'Show less' : 'Show more',
    count: count => count.toString(),
  })(RefinementListLinks)
);
