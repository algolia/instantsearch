import React from 'react';
import { useMenu, UseMenuProps } from 'react-instantsearch-hooks';

import { cx } from '../cx';
import { isSpecialClick } from '../isSpecialClick';

export type MenuProps = React.ComponentProps<'div'> & UseMenuProps;

export function Menu(props: MenuProps) {
  const {
    canToggleShowMore,
    isShowingMore,
    items,
    refine,
    createURL,
    toggleShowMore,
  } = useMenu(props);

  return (
    <div className={cx('ais-Menu', props.className)}>
      <ul className="ais-Menu-list">
        {items.map((item) => (
          <li
            key={item.value}
            className={cx(
              'ais-Menu-item',
              item.isRefined && 'ais-Menu-item--selected'
            )}
          >
            <a
              className="ais-Menu-link"
              onClick={(event) => {
                if (isSpecialClick(event)) {
                  return;
                }
                event.preventDefault();
                refine(item.value);
              }}
              href={createURL(item.value)}
            >
              <span className="ais-Menu-label">{item.label}</span>
              <span className="ais-Menu-count">{item.count}</span>
            </a>
          </li>
        ))}
      </ul>

      {props.showMore && (
        <button
          className={cx(
            'ais-Menu-showMore',
            !canToggleShowMore && 'ais-Menu-showMore--disabled'
          )}
          disabled={!canToggleShowMore}
          onClick={toggleShowMore}
        >
          {isShowingMore ? 'Show less' : 'Show more'}
        </button>
      )}
    </div>
  );
}
