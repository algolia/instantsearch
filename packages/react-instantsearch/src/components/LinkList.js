import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { has } from 'lodash';

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
      <ul {...cx('root', !canRefine && 'noRefinement')}>
        {items.map(item => (
          <li
            key={has(item, 'key') ? item.key : item.value}
            {...cx(
              'item',
              item.selected && !item.disabled && 'itemSelected',
              item.disabled && 'itemDisabled',
              item.modifier
            )}
            disabled={item.disabled}
          >
            {item.disabled ? (
              <span {...cx('itemLink', 'itemLinkDisabled')}>
                {has(item, 'label') ? item.label : item.value}
              </span>
            ) : (
              <Link
                {...cx('itemLink', item.selected && 'itemLinkSelected')}
                aria-label={item.ariaLabel}
                href={createURL(item.value)}
                onClick={onSelect.bind(null, item.value)}
              >
                {has(item, 'label') ? item.label : item.value}
              </Link>
            )}
          </li>
        ))}
      </ul>
    );
  }
}
