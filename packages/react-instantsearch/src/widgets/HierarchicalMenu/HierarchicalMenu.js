import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import List from '../../components/List';
import Link from '../../components/Link';

import theme from './HierarchicalMenu.css';

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
        href={createURL(refineValue)}
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

export default themeable(theme)(
  translatable({
    showMore: extended => extended ? 'Show less' : 'Show more',
    count: count => count.toLocaleString(),
  })(HierarchicalMenu)
);
