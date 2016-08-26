import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import List from '../../components/List';
import Link from '../../components/Link';

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

  renderItem = (item, selected) => {
    const {refine, createURL, applyTheme, translate} = this.props;
    const value = selected ? null : item.value;
    return (
      <Link
        {...applyTheme('itemLink', 'itemLink')}
        onClick={refine.bind(null, value)}
        href={createURL(value)}
      >
        <span {...applyTheme('itemLabel', 'itemLabel')}>
          {item.value}
        </span>
        {' '}
        <span {...applyTheme('itemCount', 'itemCount')}>
          {translate('count', item.count)}
        </span>
      </Link>
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
  itemLabel: 'Menu__item__value',
  itemCount: 'Menu__item__count',
  showMore: 'Menu__showMore',
})(
  translatable({
    showMore: extended => extended ? 'Show less' : 'Show more',
    count: count => count.toLocaleString(),
  })(Menu)
);
