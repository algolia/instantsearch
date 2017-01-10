import React, {PropTypes, Component} from 'react';
import List from './List';
import classNames from './classNames.js';

const cx = classNames('MultiRange');

class MultiRange extends Component {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.node.isRequired,
      value: PropTypes.string.isRequired,
    })).isRequired,
    refine: PropTypes.func.isRequired,
    transformItems: PropTypes.func,
  };

  renderItem = item => {
    const {refine} = this.props;

    return (
      <label>
        <input
          {...cx('itemRadio', item.isRefined && 'itemRadioSelected')}
          type="radio"
          checked={item.isRefined}
          onChange={refine.bind(null, item.value)}
        />
        <span {...cx('itemBox', 'itemBox', item.isRefined && 'itemBoxSelected')}></span>
        <span {...cx('itemLabel', 'itemLabel', item.isRefined && 'itemLabelSelected')}>
          {item.label}
        </span>
      </label>
    );
  };

  render() {
    const {items} = this.props;

    return (
      <List
        renderItem={this.renderItem}
        showMore={false}
        cx={cx}
        items={items.map(item => ({...item, key: item.value}))}
      />
    );
  }
}

export default MultiRange;
