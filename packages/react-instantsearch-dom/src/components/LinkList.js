import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Link from './Link';

export default class LinkList extends Component {
  static propTypes = {
    cx: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,

    items: PropTypes.arrayOf(
      PropTypes.shape({
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.object,
        ]).isRequired,

        key: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),

        label: PropTypes.node,

        modifier: PropTypes.string,
        ariaLabel: PropTypes.string,
        disabled: PropTypes.bool,
      })
    ),
    onSelect: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,
  };

  render() {
    const { cx, createURL, items, onSelect, canRefine } = this.props;
    return (
      <ul className={cx('list', !canRefine && 'list--noRefinement')}>
        {items.map((item) => (
          <li
            key={item.key === undefined ? item.value : item.key}
            className={cx(
              'item',
              item.selected && !item.disabled && 'item--selected',
              item.disabled && 'item--disabled',
              item.modifier
            )}
          >
            {item.disabled ? (
              <span className={cx('link')}>
                {item.label === undefined ? item.value : item.label}
              </span>
            ) : (
              <Link
                className={cx('link', item.selected && 'link--selected')}
                aria-label={item.ariaLabel}
                href={createURL(item.value)}
                onClick={() => onSelect(item.value)}
              >
                {item.label === undefined ? item.value : item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    );
  }
}
