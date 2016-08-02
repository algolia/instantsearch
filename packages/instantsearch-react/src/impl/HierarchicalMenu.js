import React, {PropTypes, Component} from 'react';
import pick from 'lodash/object/pick';

import themeable from '../themeable';
import translatable from '../translatable';

import List from './List';
import LinkItem from './LinkItem';

const itemsPropType = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.node,
  value: PropTypes.string.isRequired,
  count: PropTypes.number.isRequired,
  children: (...args) => itemsPropType(...args),
}));

class HierarchicalMenu extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: itemsPropType,
    selectedItems: PropTypes.arrayOf(PropTypes.string),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item => {
    const {createURL, refine, translate, applyTheme} = this.props;
    return (
      <LinkItem
        {...applyTheme('itemLink', 'itemLink')}
        onClick={refine.bind(null, item.value)}
        item={item}
        href={createURL(item.value)}
      >
        <span {...applyTheme('itemLabel', 'itemLabel')}>
          {item.label}
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
  root: 'HierarchicalMenu',
  items: 'HierarchicalMenu__items',
  item: 'HierarchicalMenu__item',
  itemSelected: 'HierarchicalMenu__item--selected',
  itemParent: 'HierarchicalMenu__item--parent',
  itemSelectedParent: 'HierarchicalMenu__item--selectedParent',
  itemLink: 'HierarchicalMenu__item__link',
  itemLabel: 'HierarchicalMenu__item__label',
  itemCount: 'HierarchicalMenu__item__count',
  itemChildren: 'HierarchicalMenu__item__children',
  showMore: 'HierarchicalMenu__showMore',
})(
  translatable({
    showMore: extended => extended ? 'Show less' : 'Show more',
    count: count => count.toString(),
  })(HierarchicalMenu)
);
