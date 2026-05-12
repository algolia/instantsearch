import { cx } from 'instantsearch-ui-components';
import React from 'react';

import { isModifierClick } from './lib/isModifierClick';

import type { RatingMenuRenderState } from 'instantsearch.js/es/connectors/rating-menu/connectRatingMenu';

export type RatingMenuProps = React.ComponentProps<'div'> & {
  items: RatingMenuRenderState['items'];
  createURL: RatingMenuRenderState['createURL'];
  onRefine: (value: string) => void;
  classNames?: Partial<RatingMenuClassNames>;
  translations?: Partial<RatingMenuTranslations>;
};

export type RatingMenuClassNames = {
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
   * Class names to apply to each disabled item element
   */
  disabledItem: string;
  /**
   * Class names to apply to each link element
   */
  link: string;
  /**
   * Class names to apply to each star icon element
   */
  starIcon: string;
  /**
   * Class names to apply to each full star icon element
   */
  fullStarIcon: string;
  /**
   * Class names to apply to each empty star icon element
   */
  emptyStarIcon: string;
  /**
   * Class names to apply to each label element
   */
  label: string;
  /**
   * Class names to apply to each count element
   */
  count: string;
};

export type RatingMenuTranslations = {
  /**
   * The text that follows the rating in each link's accessible label.
   * Receives the rating value as input.
   */
  ariaUp: (value: string) => string;
  /**
   * The text that follows the rating stars.
   */
  andUp: () => React.ReactNode;
};

export function RatingMenu({
  items,
  createURL,
  onRefine,
  classNames = {},
  translations,
  ...props
}: RatingMenuProps) {
  const ariaUp = translations?.ariaUp ?? ((value) => `${value} & up`);
  const andUp = translations?.andUp ?? (() => <>&amp; Up</>);

  return (
    <div
      {...props}
      className={cx(
        'ais-RatingMenu',
        classNames.root,
        items.length === 0 &&
          cx('ais-RatingMenu--noRefinement', classNames.noRefinementRoot),
        props.className
      )}
    >
      <svg style={{ display: 'none' }}>
        <symbol id="ais-RatingMenu-starSymbol" viewBox="0 0 24 24">
          <path d="M12 .288l2.833 8.718h9.167l-7.417 5.389 2.833 8.718-7.416-5.388-7.417 5.388 2.833-8.718-7.416-5.389h9.167z" />
        </symbol>
        <symbol id="ais-RatingMenu-starEmptySymbol" viewBox="0 0 24 24">
          <path d="M12 6.76l1.379 4.246h4.465l-3.612 2.625 1.379 4.246-3.611-2.625-3.612 2.625 1.379-4.246-3.612-2.625h4.465l1.38-4.246zm0-6.472l-2.833 8.718h-9.167l7.416 5.389-2.833 8.718 7.417-5.388 7.416 5.388-2.833-8.718 7.417-5.389h-9.167l-2.833-8.718z" />
        </symbol>
      </svg>
      <ul className={cx('ais-RatingMenu-list', classNames.list)}>
        {items.map((item) => (
          <li
            key={item.value}
            className={cx(
              'ais-RatingMenu-item',
              classNames.item,
              item.isRefined &&
                cx('ais-RatingMenu-item--selected', classNames.selectedItem),
              item.count === 0 &&
                cx('ais-RatingMenu-item--disabled', classNames.disabledItem)
            )}
          >
            <div>
              <a
                aria-label={ariaUp(item.value)}
                className={cx('ais-RatingMenu-link', classNames.link)}
                href={createURL(item.value)}
                onClick={(event) => {
                  if (isModifierClick(event)) {
                    return;
                  }
                  event.preventDefault();
                  onRefine(item.value);
                }}
              >
                {item.stars.map((isFull, index) => (
                  <svg
                    key={index}
                    aria-hidden="true"
                    className={cx(
                      'ais-RatingMenu-starIcon',
                      classNames.starIcon,
                      isFull
                        ? cx(
                            'ais-RatingMenu-starIcon--full',
                            classNames.fullStarIcon
                          )
                        : cx(
                            'ais-RatingMenu-starIcon--empty',
                            classNames.emptyStarIcon
                          )
                    )}
                    width="24"
                    height="24"
                  >
                    <use
                      href={
                        isFull
                          ? '#ais-RatingMenu-starSymbol'
                          : '#ais-RatingMenu-starEmptySymbol'
                      }
                    />
                  </svg>
                ))}
                <span
                  aria-hidden="true"
                  className={cx('ais-RatingMenu-label', classNames.label)}
                >
                  {andUp()}
                </span>
                <span className={cx('ais-RatingMenu-count', classNames.count)}>
                  {item.count.toLocaleString()}
                </span>
              </a>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
