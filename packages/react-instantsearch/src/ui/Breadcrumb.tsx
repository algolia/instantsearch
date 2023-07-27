import React from 'react';

import { cx } from './lib/cx';
import { isModifierClick } from './lib/isModifierClick';

import type { useBreadcrumb } from 'react-instantsearch-core';

export type BreadcrumbTranslations = {
  /**
   * The label of the root element
   */
  rootElementText: string;
};

export type BreadcrumbClassNames = {
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
   * Class names to apply to the selected item
   */
  selectedItem: string;
  /**
   * Class names to apply to the separator between items
   */
  separator: string;
  /**
   * Class names to apply to each link element
   */
  link: string;
};

type UseBreadcrumbRenderState = ReturnType<typeof useBreadcrumb>;

type BreadcrumbItem = UseBreadcrumbRenderState['items'][number];

export type BreadcrumbProps = React.ComponentProps<'div'> &
  Pick<UseBreadcrumbRenderState, 'items' | 'createURL'> & {
    classNames?: Partial<BreadcrumbClassNames>;
    hasItems: boolean;
    onNavigate: UseBreadcrumbRenderState['refine'];
    separator?: string;
    translations: BreadcrumbTranslations;
  };

export function Breadcrumb({
  classNames = {},
  items = [],
  hasItems,
  createURL,
  onNavigate,
  separator = '>',
  translations,
  ...props
}: BreadcrumbProps) {
  const handleClick =
    (value: BreadcrumbItem['value']) =>
    (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => {
      if (!isModifierClick(event)) {
        event.preventDefault();
        onNavigate(value);
      }
    };

  return (
    <div
      {...props}
      className={cx(
        'ais-Breadcrumb',
        classNames.root,
        !hasItems &&
          cx('ais-Breadcrumb--noRefinement', classNames.noRefinementRoot),
        props.className
      )}
    >
      <ul className={cx('ais-Breadcrumb-list', classNames.list)}>
        <li
          className={cx(
            'ais-Breadcrumb-item',
            classNames.item,
            !hasItems &&
              cx('ais-Breadcrumb-item--selected', classNames.selectedItem)
          )}
        >
          <a
            href={createURL(null)}
            onClick={handleClick(null)}
            className={cx('ais-Breadcrumb-link', classNames.link)}
          >
            {translations.rootElementText}
          </a>
        </li>

        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li
              key={index}
              className={cx(
                'ais-Breadcrumb-item',
                classNames.item,
                isLast &&
                  cx('ais-Breadcrumb-item--selected', classNames.selectedItem)
              )}
            >
              <span
                aria-hidden="true"
                className={cx('ais-Breadcrumb-separator', classNames.separator)}
              >
                {separator}
              </span>

              {isLast ? (
                item.label
              ) : (
                <a
                  className={cx('ais-Breadcrumb-link', classNames.link)}
                  href={createURL(item.value)}
                  onClick={handleClick(item.value)}
                >
                  {item.label}
                </a>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
