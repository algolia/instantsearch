import React, {PropTypes, Component} from 'react';
import pick from 'lodash/pick';

import themeable from '../../core/themeable';
import translatable from '../../core/translatable';

import List from '../../components/List';

import theme from './RefinementList.css';

class RefinementList extends Component {
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

  onItemChange = (item, e) => {
    const {selectedItems} = this.props;
    const nextSelectedItems = selectedItems.slice();
    const idx = nextSelectedItems.indexOf(item.value);
    if (e.target.checked && idx === -1) {
      nextSelectedItems.push(item.value);
    } else if (!e.target.checked && idx !== -1) {
      nextSelectedItems.splice(idx, 1);
    }
    this.props.refine(nextSelectedItems);
  }

  renderItem = (item, selected) => {
    const {translate, applyTheme} = this.props;

    return (
      <label>
        <input
          {...applyTheme('itemCheckbox', 'itemCheckbox')}
          type="checkbox"
          checked={selected}
          onChange={this.onItemChange.bind(null, item)}
        />
        <span {...applyTheme('itemLabel', 'itemLabel')}>
          {item.value}
        </span>
        {' '}
        <span {...applyTheme('itemCount', 'itemCount')}>
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
  })(RefinementList)
);
