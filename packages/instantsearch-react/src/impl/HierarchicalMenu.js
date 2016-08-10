import React, {PropTypes, Component} from 'react';
import pick from 'lodash/object/pick';

import themeable from '../themeable';
import translatable from '../translatable';

import List from './List';
import Link from './Link';

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
    selectedItem: PropTypes.string,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = (item, selected, parent, selectedParent) => {
    const {createURL, refine, translate, applyTheme} = this.props;
    let refineValue;
    if (selected || selectedParent) {
      if (parent !== null) {
        refineValue = parent.value;
      } else {
        refineValue = null;
      }
    } else {
      refineValue = item.value;
    }
    return (
      <Link
        {...applyTheme('itemLink', 'itemLink')}
        onClick={refine.bind(null, refineValue)}
        href={createURL(item.value)}
      >
        <span {...applyTheme('itemLabel', 'itemLabel')}>
          {item.label}
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
        selectedItems={
          this.props.selectedItem === null ? [] : [this.props.selectedItem]
        }
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
    count: count => count.toLocaleString(),
  })(HierarchicalMenu)
);
