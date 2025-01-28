import { cx } from 'instantsearch-ui-components';
import React from 'react';

import { isModifierClick } from './lib/isModifierClick';
import { ShowMoreButton } from './ShowMoreButton';

import type { ShowMoreButtonTranslations } from './ShowMoreButton';
import type { CreateURL, MenuItem } from 'instantsearch-core';

export type MenuProps = React.ComponentProps<'div'> & {
  items: MenuItem[];
  classNames?: Partial<MenuCSSClasses>;
  showMore?: boolean;
  canToggleShowMore: boolean;
  onToggleShowMore: () => void;
  isShowingMore: boolean;
  createURL: CreateURL<MenuItem['value']>;
  onRefine: (item: MenuItem) => void;
  translations: MenuTranslations;
};

export type MenuCSSClasses = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string;
  /**
   * Class names to apply to the list element
   */
  list: string;
  /**
   * Class names to apply to each item element
   */
  item: string;
  /**
   * Class names to apply to each selected item element
   */
  selectedItem: string;
  /**
   * Class names to apply to each link element
   */
  link: string;
  /**
   * Class names to apply to each label element
   */
  label: string;
  /**
   * Class names to apply to each facet count element
   */
  count: string;
  /**
   * Class names to apply to the "Show more" button
   */
  showMore: string;
  /**
   * Class names to apply to the "Show more" button if it's disabled
   */
  disabledShowMore: string;
};

export type MenuTranslations = ShowMoreButtonTranslations;

export function Menu({
  items,
  classNames = {},
  showMore,
  canToggleShowMore,
  onToggleShowMore,
  isShowingMore,
  createURL,
  onRefine,
  translations,
  ...props
}: MenuProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-Menu',
        classNames.root,
        items.length === 0 &&
          cx('ais-Menu--noRefinement', classNames.noRefinementRoot),
        props.className
      )}
    >
      <ul className={cx('ais-Menu-list', classNames.list)}>
        {items.map((item) => (
          <li
            key={item.label}
            className={cx(
              'ais-Menu-item',
              classNames.item,
              item.isRefined &&
                cx('ais-Menu-item--selected', classNames.selectedItem)
            )}
          >
            <a
              className={cx('ais-Menu-link', classNames.link)}
              href={createURL(item.value)}
              onClick={(event) => {
                if (isModifierClick(event)) {
                  return;
                }
                event.preventDefault();
                onRefine(item);
              }}
            >
              <span className={cx('ais-Menu-label', classNames.label)}>
                {item.label}
              </span>
              <span className={cx('ais-Menu-count', classNames.count)}>
                {item.count}
              </span>
            </a>
          </li>
        ))}
      </ul>
      {showMore && (
        <ShowMoreButton
          className={cx(
            'ais-Menu-showMore',
            classNames.showMore,
            !canToggleShowMore &&
              cx('ais-Menu-showMore--disabled', classNames.disabledShowMore)
          )}
          disabled={!canToggleShowMore}
          onClick={onToggleShowMore}
          isShowingMore={isShowingMore}
          translations={translations}
        />
      )}
    </div>
  );
}
