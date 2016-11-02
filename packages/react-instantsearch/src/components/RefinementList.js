import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../core/themeable';
import translatable from '../core/translatable';

import List from './List';

import theme from './RefinementList.css';

class RefinementList extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
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

  renderItem = item => {
    const {translate, applyTheme} = this.props;

    return (
      <label>
        <input
          {...applyTheme('itemCheckbox', 'itemCheckbox', item.isRefined && 'itemCheckboxSelected')}
          type="checkbox"
          checked={item.isRefined}
          onChange={() => this.props.refine(item.value)}
        />
        <span {...applyTheme('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
        {' '}
        <span {...applyTheme('itemCount', 'itemCount', item.isRefined && 'itemCountSelected')}>
          {translate('count', item.count)}
        </span>
      </label>
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
    count: count => count.toLocaleString(),
  })(RefinementList)
);
