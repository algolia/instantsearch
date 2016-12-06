import React, {PropTypes, Component} from 'react';
import {pick} from 'lodash';
import translatable from '../core/translatable';
import List from './List';
import Link from './Link';
import classNames from './classNames.js';

const cx = classNames('Menu');

class Menu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
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
    const {refine, createURL} = this.props;
    return (
      <Link
        {...cx('itemLink', item.isRefined && 'itemLinkSelected')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span {...cx('itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
        {' '}
        <span {...cx('itemCount', item.isRefined && 'itemCountSelected')}>
          {item.count}
        </span>
      </Link>
    );
  };

  render() {
    return (
      <List
        renderItem={this.renderItem}
        cx={cx}
        {...pick(this.props, [
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

export default translatable({
  showMore: extended => extended ? 'Show less' : 'Show more',
})(Menu);
