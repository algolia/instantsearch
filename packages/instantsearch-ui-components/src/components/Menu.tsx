/** @jsx createElement */
import { cx, isModifierClick } from '../lib';

import {
  createShowMoreButtonComponent,
  defaultShowMoreButtonTranslations,
} from './ShowMoreButton';

import type { ComponentProps, Renderer } from '../types';
import type { ShowMoreButtonTranslations } from './ShowMoreButton';

export type MenuItem = {
  /**
   * The value used to refine.
   */
  value: string;
  /**
   * The label to display.
   */
  label: string;
  /**
   * Number of results matching this value.
   */
  count: number;
  /**
   * Whether the value is selected.
   */
  isRefined: boolean;
};

export type MenuClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string | string[];
  /**
   * Class names to apply to the list element
   */
  list: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
  /**
   * Class names to apply to each selected item element
   */
  selectedItem: string | string[];
  /**
   * Class names to apply to each link element
   */
  link: string | string[];
  /**
   * Class names to apply to each label element
   */
  label: string | string[];
  /**
   * Class names to apply to each facet count element
   */
  count: string | string[];
  /**
   * Class names to apply to the "Show more" button
   */
  showMore: string | string[];
  /**
   * Class names to apply to the "Show more" button if it's disabled
   */
  disabledShowMore: string | string[];
};

export type MenuTranslations = ShowMoreButtonTranslations;

export type MenuItemComponentProps = {
  item: MenuItem;
  /**
   * The computed class names of the `<li>` root.
   */
  className: string;
  /**
   * The default item content (the link with its label and count), always
   * provided. Render it to keep the default markup inside a custom root.
   */
  children?: JSX.Element;
  key?: string | number;
};

export type MenuProps = ComponentProps<'div'> & {
  items: MenuItem[];
  /**
   * Creates the URL of each item's link.
   */
  createURL: (value: string) => string;
  /**
   * Called when an item's link is clicked (except modifier clicks, which keep
   * the browser behavior). When omitted, the link has no click handler and
   * the consumer handles clicks on its own item root.
   */
  onRefine?: (item: MenuItem) => void;
  /**
   * Overrides each item, including its `<li>` root.
   */
  itemComponent?: (props: MenuItemComponentProps) => JSX.Element;
  showMore?: boolean;
  canToggleShowMore?: boolean;
  isShowingMore?: boolean;
  onToggleShowMore?: () => void;
  /**
   * Overrides the content of the "Show more" button.
   */
  showMoreTextComponent?: (props: {
    isShowingMore: boolean;
  }) => JSX.Element | string | null;
  classNames?: Partial<MenuClassNames>;
  translations?: Partial<MenuTranslations>;
};

export function createMenuComponent({ createElement, Fragment }: Renderer) {
  const ShowMoreButton = createShowMoreButtonComponent({
    createElement,
    Fragment,
  });

  function DefaultItemComponent({
    item: _item,
    children,
    ...rootProps
  }: MenuItemComponentProps) {
    return <li {...rootProps}>{children}</li>;
  }

  return function Menu(userProps: MenuProps) {
    const {
      items,
      createURL,
      onRefine,
      itemComponent: ItemComponent = DefaultItemComponent,
      showMore = false,
      canToggleShowMore = false,
      isShowingMore = false,
      onToggleShowMore,
      showMoreTextComponent,
      classNames = {},
      translations: userTranslations,
      ...props
    } = userProps;

    const translations = {
      ...defaultShowMoreButtonTranslations,
      ...userTranslations,
    };

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
            <ItemComponent
              key={item.value}
              item={item}
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
                onClick={
                  onRefine
                    ? (event) => {
                        if (isModifierClick(event)) {
                          return;
                        }
                        event.preventDefault();
                        onRefine(item);
                      }
                    : undefined
                }
              >
                <span className={cx('ais-Menu-label', classNames.label)}>
                  {item.label}
                </span>
                <span className={cx('ais-Menu-count', classNames.count)}>
                  {item.count.toLocaleString()}
                </span>
              </a>
            </ItemComponent>
          ))}
        </ul>
        {showMore && (
          <ShowMoreButton
            widgetName="Menu"
            canToggleShowMore={canToggleShowMore}
            isShowingMore={isShowingMore}
            onToggleShowMore={onToggleShowMore}
            showMoreTextComponent={showMoreTextComponent}
            classNames={classNames}
            translations={translations}
          />
        )}
      </div>
    );
  };
}
