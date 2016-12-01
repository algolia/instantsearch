import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';
import translatable from '../core/translatable';
import List from './List';
import Link from './Link';
import classNames from './classNames.js';

const cx = classNames('HierarchicalMenu');

const itemsPropType = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  count: PropTypes.number.isRequired,
  children: (...args) => itemsPropType(...args),
}));

class HierarchicalMenu extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,
    items: itemsPropType,
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item => {
    const {createURL, refine} = this.props;

    return (
      <Link
        {...cx('itemLink')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span {...cx('itemLabel')}>
          {item.label}
        </span>
        {' '}
        <span {...cx('itemCount')}>
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
})(HierarchicalMenu);
