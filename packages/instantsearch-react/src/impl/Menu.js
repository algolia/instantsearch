import React, {PropTypes, Component} from 'react';
import pick from 'lodash/object/pick';

import themeable from '../themeable';
import translatable from '../translatable';

import List from './List';
import LinkItem from './LinkItem';

class Menu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })),
    selectedItem: PropTypes.string,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item => {
    const {refine, createURL, applyTheme, translate} = this.props;
    return (
      <LinkItem
        {...applyTheme('itemLink', 'itemLink')}
        onClick={refine}
        item={item.value}
        href={createURL(item.value)}
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
  };

  render() {
    return (
      <List
        renderItem={this.renderItem}
        selectedItems={[this.props.selectedItem]}
        {...pick(this.props, [
          'applyTheme',
          'translate',
          'items',
          'showMore',
          'limitMin',
          'limitMax',
        ])}
      />
    );
  }
}

export default themeable({
  root: 'Menu',
  items: 'Menu__items',
  item: 'Menu__item',
  itemSelected: 'Menu__item--selected',
  itemLink: 'Menu__item__link',
  itemValue: 'Menu__item__value',
  itemCount: 'Menu__item__count',
  showMore: 'Menu__showMore',
})(
  translatable({
    showMore: extended => extended ? 'Show less' : 'Show more',
    count: count => count.toString(),
  })(Menu)
);
