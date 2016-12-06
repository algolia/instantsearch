import React, {PropTypes, Component} from 'react';
import {pick} from 'lodash';
import translatable from '../core/translatable';
import List from './List';
import classNames from './classNames.js';

const cx = classNames('RefinementList');

class RefinementList extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.arrayOf(PropTypes.string).isRequired,
      count: PropTypes.number.isRequired,
      isRefined: PropTypes.bool.isRequired,
    })),
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item =>
      <label>
        <input
          {...cx('itemCheckbox', item.isRefined && 'itemCheckboxSelected')}
          type="checkbox"
          checked={item.isRefined}
          onChange={() => this.props.refine(item.value)}
        />
        <span {...cx('itemBox', 'itemBox', item.isRefined && 'itemBoxSelected')}></span>
        <span {...cx('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
        {' '}
        <span {...cx('itemCount', item.isRefined && 'itemCountSelected')}>
          {item.count}
        </span>
      </label>
    ;

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
})(RefinementList);
