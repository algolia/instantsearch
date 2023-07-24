import PropTypes from 'prop-types';
import React, { Component } from 'react';

export default class Select extends Component {
  static propTypes = {
    cx: PropTypes.func.isRequired,
    id: PropTypes.string,
    onSelect: PropTypes.func.isRequired,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,

        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        label: PropTypes.string,
        disabled: PropTypes.bool,
      })
    ).isRequired,
    selectedItem: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
      .isRequired,
  };

  onChange = (e) => {
    this.props.onSelect(e.target.value);
  };

  render() {
    const { cx, id, items, selectedItem } = this.props;

    return (
      <select
        id={id}
        className={cx('select')}
        value={selectedItem}
        onChange={this.onChange}
      >
        {items.map((item) => (
          <option
            className={cx('option')}
            key={item.key === undefined ? item.value : item.key}
            disabled={item.disabled}
            value={item.value}
          >
            {item.label === undefined ? item.value : item.label}
          </option>
        ))}
      </select>
    );
  }
}
