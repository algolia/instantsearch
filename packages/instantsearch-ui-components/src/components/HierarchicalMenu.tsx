/** @jsx createElement */
import { cx, isModifierClick } from '../lib';

import {
  createShowMoreButtonComponent,
  defaultShowMoreButtonTranslations,
} from './ShowMoreButton';

import type { ComponentProps, Renderer } from '../types';
import type { ShowMoreButtonTranslations } from './ShowMoreButton';

export type HierarchicalMenuItem = {
  /**
   * The value used to refine (the full path of the category).
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
  /**
   * The child items, when this item is expanded.
   */
  data: HierarchicalMenuItem[] | null;
};

export type HierarchicalMenuClassNames = {
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
   * Class names to apply to each child list element
   */
  childList: string | string[];
  /**
   * Class names to apply to each item element
   */
  item: string | string[];
  /**
   * Class names to apply to the selected item
   */
  selectedItem: string | string[];
  /**
   * Class names to apply to the parent item of the list
   */
  parentItem: string | string[];
  /**
   * Class names to apply to each link element
   */
  link: string | string[];
  /**
   * Class names to apply to the link of each selected item
   */
  selectedItemLink: string | string[];
  /**
   * Class names to apply to the label of an item element
   */
  label: string | string[];
  /**
   * Class names to apply to the count of an item element
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

export type HierarchicalMenuTranslations = ShowMoreButtonTranslations;

export type HierarchicalMenuItemComponentProps = {
  item: HierarchicalMenuItem;
  /**
   * The computed class names of the `<li>` root.
   */
  className: string;
  /**
   * The default item content (the link with its label and count), always
   * provided. Render it to keep the default markup inside a custom root.
   */
  children?: JSX.Element;
  /**
   * The list of child items, when the item has some. Render it after the
   * item content.
   */
  childList: JSX.Element | null;
  key?: string | number;
};

export type HierarchicalMenuProps = ComponentProps<'div'> & {
  items: HierarchicalMenuItem[];
  /**
   * Creates the URL of each item's link.
   */
  createURL: (value: string) => string;
  /**
   * Called when an item's link is clicked (except modifier clicks, which keep
   * the browser behavior). When omitted, the link has no click handler and
   * the consumer handles clicks on its own item root.
   */
  onRefine?: (item: HierarchicalMenuItem) => void;
  /**
   * Overrides each item, including its `<li>` root.
   */
  itemComponent?: (props: HierarchicalMenuItemComponentProps) => JSX.Element;
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
  classNames?: Partial<HierarchicalMenuClassNames>;
  translations?: Partial<HierarchicalMenuTranslations>;
};

export function createHierarchicalMenuComponent({
  createElement,
  Fragment,
}: Renderer) {
  const ShowMoreButton = createShowMoreButtonComponent({
    createElement,
    Fragment,
  });

  function DefaultItemComponent({
    item: _item,
    children,
    childList,
    ...rootProps
  }: HierarchicalMenuItemComponentProps) {
    return (
      <li {...rootProps}>
        {children}
        {childList}
      </li>
    );
  }

  return function HierarchicalMenu(userProps: HierarchicalMenuProps) {
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

    // A plain function (not a component) so the nested lists don't add a
    // component boundary, which Vue's compat layer would render eagerly anyway.
    function renderList(
      listItems: HierarchicalMenuItem[],
      level: number
    ): JSX.Element | null {
      if (listItems.length === 0) {
        return null;
      }

      return (
        <ul
          className={cx(
            'ais-HierarchicalMenu-list',
            classNames.list,
            level > 0 &&
              cx('ais-HierarchicalMenu-list--child', classNames.childList),
            `ais-HierarchicalMenu-list--lvl${level}`
          )}
        >
          {listItems.map((item) => {
            const hasChildren = Boolean(item.data && item.data.length > 0);

            return (
              <ItemComponent
                key={item.value}
                item={item}
                className={cx(
                  'ais-HierarchicalMenu-item',
                  classNames.item,
                  item.isRefined &&
                    cx(
                      'ais-HierarchicalMenu-item--selected',
                      classNames.selectedItem
                    ),
                  hasChildren &&
                    cx(
                      'ais-HierarchicalMenu-item--parent',
                      classNames.parentItem
                    )
                )}
                childList={
                  hasChildren ? renderList(item.data!, level + 1) : null
                }
              >
                <a
                  className={cx(
                    'ais-HierarchicalMenu-link',
                    classNames.link,
                    item.isRefined &&
                      cx(
                        'ais-HierarchicalMenu-link--selected',
                        classNames.selectedItemLink
                      )
                  )}
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
                  <span
                    className={cx(
                      'ais-HierarchicalMenu-label',
                      classNames.label
                    )}
                  >
                    {item.label}
                  </span>
                  <span
                    className={cx(
                      'ais-HierarchicalMenu-count',
                      classNames.count
                    )}
                  >
                    {item.count.toLocaleString()}
                  </span>
                </a>
              </ItemComponent>
            );
          })}
        </ul>
      );
    }

    return (
      <div
        {...props}
        className={cx(
          'ais-HierarchicalMenu',
          classNames.root,
          items.length === 0 &&
            cx(
              'ais-HierarchicalMenu--noRefinement',
              classNames.noRefinementRoot
            ),
          props.className
        )}
      >
        {renderList(items, 0)}
        {showMore && (
          <ShowMoreButton
            widgetName="HierarchicalMenu"
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
