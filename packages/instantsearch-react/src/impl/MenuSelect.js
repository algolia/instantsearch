import React, {PropTypes, Component} from 'react';

import translatable from '../translatable';

class MenuSelect extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string.isRequired,
      count: PropTypes.number.isRequired,
    })).isRequired,
    selectedItem: PropTypes.string.isRequired,
  };

  onChange = e => {
    if (e.target.value === '') {
      this.props.refine(null);
    } else {
      this.props.refine(e.target.value);
    }
  }

  render() {
    const {items, selectedItem, translate} = this.props;

    return (
      <select value={selectedItem || ''} onChange={this.onChange}>
        <option value="">
          {translate('none')}
        </option>
        {items.map(item =>
          <option key={item.value} value={item.value}>
            {item.value}
            {' '}
            {translate('count', item.count)}
          </option>
        )}
      </select>
    );
  }
}

export default translatable({
  none: 'None',
  count: count => count.toString(),
})(MenuSelect);
