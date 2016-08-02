import React, {PropTypes, Component} from 'react';

import translatable from '../translatable';

class Select extends Component {
  static propTypes = {
    translate: PropTypes.func.isRequired,
    refine: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
      value: PropTypes.string,
      count: PropTypes.number,
    })),
    selectedItem: PropTypes.string,
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
    if (!items) {
      return null;
    }

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
})(Select);
