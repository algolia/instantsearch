import { getHighlightedParts, unescape } from 'instantsearch.js/es/lib/utils';
import React from 'react';

import { Highlight } from './Highlight';
import { cx } from './lib/cx';

import type { RefinementListItem } from 'instantsearch.js/es/connectors/refinement-list/connectRefinementList';

export type RefinementListProps = React.HTMLAttributes<HTMLDivElement> & {
  items: RefinementListItem[];
  onRefine(item: RefinementListItem): void;
  query: string;
  searchBox?: React.ReactNode;
  noResults?: React.ReactNode;
  showMoreButton?: React.ReactNode;
};

export function RefinementList({
  items,
  onRefine,
  query,
  searchBox,
  noResults,
  showMoreButton,
  ...props
}: RefinementListProps) {
  return (
    <div {...props} className={cx('ais-RefinementList', props.className)}>
      {searchBox && (
        <div className="ais-RefinementList-searchBox">{searchBox}</div>
      )}
      {noResults ? (
        <div className="ais-RefinementList-noResults">{noResults}</div>
      ) : (
        <ul className="ais-RefinementList-list">
          {items.map((item) => (
            <li
              key={item.value}
              className={cx(
                'ais-RefinementList-item',
                item.isRefined && 'ais-RefinementList-item--selected'
              )}
            >
              <label className="ais-RefinementList-label">
                <input
                  checked={item.isRefined}
                  className="ais-RefinementList-checkbox"
                  type="checkbox"
                  value={item.value}
                  onChange={() => {
                    onRefine(item);
                  }}
                />
                <span className="ais-RefinementList-labelText">
                  {query.length > 0 ? (
                    <Highlight
                      parts={[
                        getHighlightedParts(unescape(item.highlighted || '')),
                      ]}
                      classNames={{
                        root: 'ais-Highlight',
                        highlighted: 'ais-Highlight-highlighted',
                        nonHighlighted: 'ais-Highlight-nonHighlighted',
                        separator: 'ais-Highlight-separator',
                      }}
                    />
                  ) : (
                    item.label
                  )}
                </span>
                <span className="ais-RefinementList-count">{item.count}</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      {showMoreButton}
    </div>
  );
}
