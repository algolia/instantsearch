import classNames from 'classnames';
import React, { useMemo, useState } from 'react';
import type { CSSProperties } from 'react';

import { Layout, Shape } from './types';
import type { ColorHit, LayoutType, ShapeType } from './types';
import {
  getContrastColor,
  parseItems,
  sortByColors,
  sortByLabel,
} from './utils';

export type TranslationsType = Partial<{
  refineOn: (value: string) => string;
  colors: (refinedCount: number) => string;
  showMore: (expanded: boolean) => string;
}>;

export interface ColorRefinementListComponentProps {
  items: any[];
  refine: (value: string) => void;
  sortByColor?: boolean;
  layout?: LayoutType;
  shape?: ShapeType;
  pinRefined?: boolean;
  limit?: number;
  showMore?: boolean;
  showMoreLimit?: number;
  separator?: string;
  className?: string;
  translations?: TranslationsType;
  canToggleShowMore?: boolean;
  isShowingMore?: boolean;
  toggleShowMore?: () => void;
}

const cx = (...args: (string | false | undefined)[]) => {
  const baseClass = 'ais-ColorRefinementList';
  return classNames(
    baseClass,
    ...args.map((arg) => (arg && arg !== '' ? `${baseClass}-${arg}` : false))
  );
};

const RefinedIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="currentColor"
  >
    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
  </svg>
);

const defaultTranslations: Required<TranslationsType> = {
  refineOn: (value: string) => `Refine on ${value}`,
  colors: (refinedCount: number) =>
    `Colors${refinedCount ? `, ${refinedCount} selected` : ''}`,
  showMore: (expanded: boolean): string =>
    expanded ? 'Show less' : 'Show more',
};

export const ColorRefinementListComponent = ({
  items,
  refine,
  sortByColor = true,
  layout = Layout.Grid,
  shape = Shape.Circle,
  pinRefined = false,
  limit = 10,
  showMore = false,
  showMoreLimit = 20,
  separator = ';',
  className,
  translations: userTranslations,
  canToggleShowMore = false,
  isShowingMore = false,
  toggleShowMore,
}: ColorRefinementListComponentProps) => {
  const translations = { ...defaultTranslations, ...userTranslations };

  let resultItems = items as ColorHit[];

  // Parse items color label to RGB/Hex
  resultItems = useMemo(
    () => parseItems(resultItems, separator),
    [resultItems, separator]
  );

  // Sort items by label
  resultItems = useMemo(() => sortByLabel(resultItems), [resultItems]);

  // Sort items by colors
  const resultItemsSortedByColors = useMemo(
    () => sortByColors(resultItems),
    [resultItems]
  );
  if (resultItems.length > 1 && sortByColor) {
    resultItems = resultItemsSortedByColors;
  }

  // Filter result items
  const refinedItems = resultItems.filter((hit) => hit.isRefined);
  const notRefinedItems = resultItems.filter((hit) => !hit.isRefined);
  const refinedItemsLength = refinedItems.length;

  if (!isShowingMore) {
    if (pinRefined) {
      // If not expanded, concat refined items with not refined ones to reach the limit
      // Refined items are pinned at the top and never gets sliced
      resultItems = refinedItems.concat(
        notRefinedItems.slice(0, Math.max(0, limit - refinedItemsLength))
      );
    } else {
      // Slice result items to the limit
      resultItems = resultItems.slice(0, limit);
    }
  } else {
    // If expanded, limit items to show more limit
    resultItems = resultItems.slice(0, showMoreLimit);
  }

  // Render an item
  const renderItem = (item: ColorHit) => {
    if (!item.hex && !item.url) return undefined;

    const colorCn = [cx('color')];
    if (item.hex) {
      colorCn.push(`color--${item.hex.toLowerCase().substring(1)}`);
    }

    const colorStyles: CSSProperties = {};
    if (item.hex) {
      colorStyles.backgroundColor = item.hex;
    }
    if (item.url) {
      colorStyles.backgroundImage = `url(${item.url})`;
    }

    return (
      <button
        type="button"
        key={item.label}
        className={cx('item', item.isRefined ? 'itemRefined' : '')}
        role="menuitemcheckbox"
        aria-checked={item.isRefined}
        aria-label={translations.refineOn(item.label)}
        onClick={(event) => {
          event.preventDefault();
          refine(item.value);
        }}
      >
        <div className={colorCn.join(' ')} style={colorStyles}>
          <div
            className={cx('refinedIcon')}
            style={
              {
                '--contrast-color': item.rgb
                  ? getContrastColor(item.rgb)
                  : undefined,
              } as CSSProperties
            }
          >
            <RefinedIcon />
          </div>
        </div>
        <div className={cx('label')}>{item.label}</div>
        <div className={classNames(cx('count'), 'ais-RefinementList-count')}>
          {item.count.toLocaleString()}
        </div>
      </button>
    );
  };

  // Render component
  return (
    <div
      className={classNames(
        cx('', `layout${layout}`, `shape${shape}`),
        className
      )}
    >
      <div
        className={cx('items')}
        role="group"
        aria-label={translations.colors(refinedItemsLength)}
      >
        {resultItems.map(renderItem)}
      </div>
      {showMore && canToggleShowMore && toggleShowMore && (
        <button
          type="button"
          className="ais-RefinementList-showMore"
          onClick={toggleShowMore}
        >
          {translations.showMore(isShowingMore)}
        </button>
      )}
    </div>
  );
};
