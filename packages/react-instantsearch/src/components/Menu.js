import React, {PropTypes, Component} from 'react';
import {pick} from 'lodash';
import translatable from '../core/translatable';
import List from './List';
import Link from './Link';
import Highlight from '../widgets/Highlight';
import classNames from './classNames.js';

const cx = classNames('Menu');

class Menu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    searchForFacetValues: PropTypes.func,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
      isRefined: PropTypes.bool.isRequired,
    })),
    isFromSearch: PropTypes.bool.isRequired,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item => {
    const {refine, createURL} = this.props;
    const label = item._highlightResult
      ? <Highlight attributeName="label" hit={item}/>
      : item.label;
    return (
      <Link
        {...cx('itemLink', item.isRefined && 'itemLinkSelected')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span {...cx('itemLabel', item.isRefined && 'itemLabelSelected')}>
          {label}
        </span>
        {' '}
        <span {...cx('itemCount', item.isRefined && 'itemCountSelected')}>
          {item.count}
        </span>
      </Link>
    );
  };

  selectItem = item => {
    this.props.refine(item.value);
  };

  render() {
    return (
      <List
        renderItem={this.renderItem}
        selectItem={this.selectItem}
        cx={cx}
        {...pick(this.props, [
          'translate',
          'items',
          'showMore',
          'limitMin',
          'limitMax',
          'isFromSearch',
          'searchForFacetValues',
        ])}
      />
    );
  }
}

export default translatable({
  showMore: extended => extended ? 'Show less' : 'Show more',
  noResults: 'No Results',
})(Menu);
