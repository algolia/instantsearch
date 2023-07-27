import { getHighlightedParts, unescape } from 'instantsearch.js/es/lib/utils';
import React from 'react';

import { Highlight } from './Highlight';
import { cx } from './lib/cx';
import { ShowMoreButton } from './ShowMoreButton';

import type { ShowMoreButtonTranslations } from './ShowMoreButton';
import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

export type RefinementListProps = React.ComponentProps<'div'> & {
  canRefine: boolean;
  items: RefinementListItem[];
  onRefine: (item: RefinementListItem) => void;
  query: string;
  searchBox?: React.ReactNode;
  noResults?: React.ReactNode;
  showMore?: boolean;
  canToggleShowMore: boolean;
  onToggleShowMore: () => void;
  isShowingMore: boolean;
  classNames?: Partial<RefinementListClassNames>;
  translations: RefinementListTranslations;
};

export type RefinementListClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string;
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string;
  /**
   * Class names to apply to the search box wrapper element
   */
  searchBox: string;
  /**
   * Class names to apply to the root element
   */
  noResults: string;
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
   * Class names to apply to each label element
   */
  label: string;
  /**
   * Class names to apply to each checkbox element
   */
  checkbox: string;
  /**
   * Class names to apply to the text for each label
   */
  labelText: string;
  /**
   * Class names to apply to the facet count of each item
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

export type RefinementListTranslations = ShowMoreButtonTranslations;

export function RefinementList({
  canRefine,
  items,
  onRefine,
  query,
  searchBox,
  noResults,
  showMore,
  canToggleShowMore,
  onToggleShowMore,
  isShowingMore,
  className,
  classNames = {},
  translations,
  ...props
}: RefinementListProps) {
  return (
    <div
      {...props}
      className={cx(
        'ais-RefinementList',
        classNames.root,
        !canRefine &&
          cx('ais-RefinementList--noRefinement', classNames.noRefinementRoot),
        className
      )}
    >
      {searchBox && (
        <div
          className={cx('ais-RefinementList-searchBox', classNames.searchBox)}
        >
          {searchBox}
        </div>
      )}
      {noResults ? (
        <div
          className={cx('ais-RefinementList-noResults', classNames.noResults)}
        >
          {noResults}
        </div>
      ) : (
        <ul className={cx('ais-RefinementList-list', classNames.list)}>
          {items.map((item) => (
            <li
              key={item.value}
              className={cx(
                'ais-RefinementList-item',
                classNames.item,
                item.isRefined &&
                  cx(
                    'ais-RefinementList-item--selected',
                    classNames.selectedItem
                  )
              )}
            >
              <label
                className={cx('ais-RefinementList-label', classNames.label)}
              >
                <input
                  checked={item.isRefined}
                  className={cx(
                    'ais-RefinementList-checkbox',
                    classNames.checkbox
                  )}
                  type="checkbox"
                  value={item.value}
                  onChange={() => {
                    onRefine(item);
                  }}
                />
                <span
                  className={cx(
                    'ais-RefinementList-labelText',
                    classNames.labelText
                  )}
                >
                  {query.length > 0 ? (
                    <Highlight
                      parts={[
                        getHighlightedParts(unescape(item.highlighted || '')),
                      ]}
                    />
                  ) : (
                    item.label
                  )}
                </span>
                <span
                  className={cx('ais-RefinementList-count', classNames.count)}
                >
                  {item.count}
                </span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {showMore && (
        <ShowMoreButton
          className={cx(
            'ais-RefinementList-showMore',
            classNames.showMore,
            !canToggleShowMore &&
              cx(
                'ais-RefinementList-showMore--disabled',
                classNames.disabledShowMore
              )
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
