import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import List from '../../components/List';
import Link from '../../components/Link';

import theme from './RefinementListLinks.css';

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

  renderItem = item => {
    const {createURL, applyTheme, translate} = this.props;
    const value = this.getSelectedItems(item);
    return (
      <Link
        {...applyTheme('itemLink', 'itemLink')}
        onClick={this.props.refine.bind(null, value)}
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

export default themeable(theme)(
  translatable({
    showMore: extended => extended ? 'Show less' : 'Show more',
    count: count => count.toLocaleString(),
  })(RefinementListLinks)
);
