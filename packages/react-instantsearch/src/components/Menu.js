import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import List from './List';
import Link from './Link';

import theme from './Menu.css';

class Menu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    applyTheme: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      isRefined: PropTypes.bool.isRequired,
    })),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item => {
    const {refine, createURL, applyTheme} = this.props;
    return (
      <Link
        {...applyTheme('itemLink', 'itemLink', item.isRefined && 'itemLinkSelected')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span {...applyTheme('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
        {' '}
        <span {...applyTheme('itemCount', 'itemCount', item.isRefined && 'itemCountSelected')}>
          {item.count}
        </span>
      </Link>
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
  })(Menu)
);
