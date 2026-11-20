/** @jsx createElement */
import { cx, isModifierClick } from '../lib';

import type { ComponentProps, Renderer } from '../types';

export type RatingMenuItem = {
  /**
   * The minimum rating, used to refine.
   */
  value: string;
  /**
   * The label to display.
   */
  label: string;
  /**
   * Number of results with at least this rating.
   */
  count: number;
  /**
   * Whether the rating is selected.
   */
  isRefined: boolean;
  /**
   * Whether each star is full (`true`) or empty (`false`).
   */
  stars: boolean[];
};

export type RatingMenuClassNames = {
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
   * Class names to apply to each item without results
   */
  disabledItem: string | string[];
  /**
   * Class names to apply to each link element
   */
  link: string | string[];
  /**
   * Class names to apply to each star icon
   */
  starIcon: string | string[];
  /**
   * Class names to apply to each full star icon
   */
  fullStarIcon: string | string[];
  /**
   * Class names to apply to each empty star icon
   */
  emptyStarIcon: string | string[];
  /**
   * Class names to apply to each label element
   */
  label: string | string[];
  /**
   * Class names to apply to each facet count element
   */
  count: string | string[];
};

export type RatingMenuTranslations = {
  /**
   * The text displayed after the stars.
   */
  andUpText: string;
  /**
   * Accessible name (aria-label) of each item's link.
   */
  itemAriaLabel: (options: { value: string }) => string;
};

export type RatingMenuItemComponentProps = {
  item: RatingMenuItem;
  /**
   * The computed class names of the `<li>` root.
   */
  className: string;
  /**
   * The default item content (the link with the stars, label and count),
   * always provided. Render it to keep the default markup inside a custom root.
   */
  children?: JSX.Element;
  key?: string | number;
};

export type RatingMenuProps = ComponentProps<'div'> & {
  items: RatingMenuItem[];
  /**
   * Whether the widget can refine, which drives the `noRefinement` modifier
   * of the root. Defaults to whether there are items.
   */
  canRefine?: boolean;
  /**
   * Creates the URL of each item's link.
   */
  createURL: (value: string) => string;
  /**
   * Called when an item's link is clicked (except modifier clicks, which keep
   * the browser behavior). When omitted, the link has no click handler and
   * the consumer handles clicks on its own item root.
   */
  onRefine?: (item: RatingMenuItem) => void;
  /**
   * Overrides each item, including its `<li>` root.
   */
  itemComponent?: (props: RatingMenuItemComponentProps) => JSX.Element;
  /**
   * Overrides the text displayed after the stars.
   */
  andUpComponent?: () => JSX.Element | string | null;
  classNames?: Partial<RatingMenuClassNames>;
  translations?: Partial<RatingMenuTranslations>;
};

const defaultTranslations: RatingMenuTranslations = {
  andUpText: '& Up',
  itemAriaLabel({ value }) {
    return `${value} & up`;
  },
};

export function createRatingMenuComponent({ createElement }: Renderer) {
  function DefaultItemComponent({
    item: _item,
    children,
    ...rootProps
  }: RatingMenuItemComponentProps) {
    return <li {...rootProps}>{children}</li>;
  }

  return function RatingMenu(userProps: RatingMenuProps) {
    const {
      items,
      canRefine = items.length > 0,
      createURL,
      onRefine,
      itemComponent: ItemComponent = DefaultItemComponent,
      andUpComponent,
      classNames = {},
      translations: userTranslations,
      ...props
    } = userProps;

    const translations = { ...defaultTranslations, ...userTranslations };

    return (
      <div
        {...props}
        className={cx(
          'ais-RatingMenu',
          classNames.root,
          !canRefine &&
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
          {items.map((item) => {
            const isDisabled = !item.count;
            const content = [
              ...item.stars.map((isFull, index) => (
                <svg
                  key={index}
                  aria-hidden="true"
                  width="24"
                  height="24"
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
                >
                  <use
                    href={
                      isFull
                        ? '#ais-RatingMenu-starSymbol'
                        : '#ais-RatingMenu-starEmptySymbol'
                    }
                  />
                </svg>
              )),
              <span
                key="label"
                aria-hidden="true"
                className={cx('ais-RatingMenu-label', classNames.label)}
              >
                {andUpComponent ? andUpComponent() : translations.andUpText}
              </span>,
              <span
                key="count"
                className={cx('ais-RatingMenu-count', classNames.count)}
              >
                {item.count.toLocaleString()}
              </span>,
            ];
            const linkClassName = cx('ais-RatingMenu-link', classNames.link);
            const ariaLabel = translations.itemAriaLabel({ value: item.value });

            return (
              <ItemComponent
                key={item.value}
                item={item}
                className={cx(
                  'ais-RatingMenu-item',
                  classNames.item,
                  item.isRefined &&
                    cx(
                      'ais-RatingMenu-item--selected',
                      classNames.selectedItem
                    ),
                  isDisabled &&
                    cx('ais-RatingMenu-item--disabled', classNames.disabledItem)
                )}
              >
                {isDisabled ? (
                  <div
                    className={linkClassName}
                    aria-label={ariaLabel}
                    aria-disabled="true"
                  >
                    {content}
                  </div>
                ) : (
                  <a
                    className={linkClassName}
                    aria-label={ariaLabel}
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
                    {content}
                  </a>
                )}
              </ItemComponent>
            );
          })}
        </ul>
      </div>
    );
  };
}
