import React, {PropTypes, Component} from 'react';
import {has} from 'lodash';

import Link from './Link';

export default class LinkList extends Component {
  static propTypes = {
    applyTheme: PropTypes.func.isRequired,
    createURL: PropTypes.func.isRequired,

    /**
     * List of items to render.
     * @public
     */
    items: PropTypes.arrayOf(
      /**
       * @shape Item
       */
      PropTypes.shape({
        /**
         * The value of the item.
         * @public
         */
        value: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
          PropTypes.object,
        ]).isRequired,

        /**
         * When you have multiple items with the same value, another hint is
         * needed in order to differentiate them. Defaults to `value`.
         * @public
         */
        key: PropTypes.oneOfType([
          PropTypes.string,
          PropTypes.number,
        ]),

        /**
         * Label to render for this item.
         * @public
         */
        label: PropTypes.node,

        modifier: PropTypes.string,
        ariaLabel: PropTypes.string,
        disabled: PropTypes.bool,
      })
    ),
    selectedItem: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.number,
      PropTypes.object,
    ]),
    onSelect: PropTypes.func.isRequired,
  };

  render() {
    const {applyTheme, createURL, items, selectedItem, onSelect} = this.props;
    return (
      <ul {...applyTheme('root', 'root')}>
        {items.map(item =>
          <li // eslint-disable-line react/jsx-key, automatically done by themeable
            {...applyTheme(
              has(item, 'key') ? item.key : item.value,
              'item',
              // eslint-disable-next-line
              item.value == selectedItem && 'itemSelected',
              item.disabled && 'itemDisabled',
              item.modifier
            )}
          >
            {item.disabled ?
              <span {...applyTheme('itemLink', 'itemLink')}>
                {has(item, 'label') ? item.label : item.value}
              </span> :
              <Link
                {...applyTheme('itemLink', 'itemLink')}
                aria-label={item.ariaLabel}
                href={createURL(item.value)}
                onClick={onSelect.bind(null, item.value)}
              >
                {has(item, 'label') ? item.label : item.value}
              </Link>
            }
          </li>
        )}
      </ul>
    );
  }
}
