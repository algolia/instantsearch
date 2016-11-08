import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import List from './List';
import Link from './Link';

import theme from './HierarchicalMenu.css';

const itemsPropType = PropTypes.arrayOf(PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
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
    showMore: PropTypes.bool,
    limitMin: PropTypes.number,
    limitMax: PropTypes.number,
  };

  renderItem = item => {
    const {createURL, refine, applyTheme} = this.props;

    return (
      <Link
        {...applyTheme('itemLink', 'itemLink')}
        onClick={() => refine(item.value)}
        href={createURL(item.value)}
      >
        <span {...applyTheme('itemLabel', 'itemLabel')}>
          {item.label}
        </span>
        {' '}
        <span {...applyTheme('itemCount', 'itemCount')}>
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
  })(HierarchicalMenu)
);
