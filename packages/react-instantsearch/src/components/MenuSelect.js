import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { find } from 'lodash';

import classNames from './classNames.js';
import translatable from '../core/translatable';

const cx = classNames('MenuSelect');

class MenuSelect extends Component {
  static propTypes = {
    canRefine: PropTypes.bool.isRequired,
    refine: PropTypes.func.isRequired,
    translate: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        label: PropTypes.string.isRequired,
        value: PropTypes.string.isRequired,
        count: PropTypes.number.isRequired,
        isRefined: PropTypes.bool.isRequired,
      })
    ),
  };

  static contextTypes = {
    canRefine: PropTypes.func,
  };

  get selectedValue() {
    const { value } = find(this.props.items, { isRefined: true }) || {
      value: 'ais__see__all__option',
    };
    return value;
  }

  componentWillMount() {
    if (this.context.canRefine) this.context.canRefine(this.props.canRefine);
  }

  componentWillReceiveProps(props) {
    if (this.context.canRefine) this.context.canRefine(props.canRefine);
  }

  handleSelectChange = ({ target: { value } }) => {
    this.props.refine(value === 'ais__see__all__option' ? '' : value);
  };

  render() {
    const { items, translate } = this.props;

    return (
      <select
        value={this.selectedValue}
        onChange={this.handleSelectChange}
        {...cx('select')}
      >
        <option value="ais__see__all__option" {...cx('option')}>
          {translate('seeAllOption')}
        </option>

        {items.map(item => (
          <option key={item.value} value={item.value} {...cx('option')}>
            {item.label} ({item.count})
          </option>
        ))}
      </select>
    );
  }
}

export default translatable({
  seeAllOption: 'See all',
})(MenuSelect);
