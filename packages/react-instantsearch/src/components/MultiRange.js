import React, {PropTypes, Component} from 'react';

import themeable from '../core/themeable';

import List from './List';

import theme from './MultiRange.css';

class MultiRange extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,
    refine: PropTypes.func.isRequired,
  };

  renderItem = item => {
    const {applyTheme, refine} = this.props;

    return (
      <label>
        <input
          {...applyTheme('itemRadio', 'itemRadio', item.isRefined && 'itemRadioSelected')}
          type="radio"
          checked={item.isRefined}
          onChange={refine.bind(null, item.value)}
        />
        <span {...applyTheme('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
      </label>
    );
  };

  render() {
    const {items, applyTheme} = this.props;

    return (
      <List
        renderItem={this.renderItem}
        showMore={false}
        applyTheme={applyTheme}
        items={items.map(item => ({...item, key: item.value}))}
      />
    );
  }
}

export default themeable(theme)(MultiRange);
