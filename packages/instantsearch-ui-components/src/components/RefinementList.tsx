/** @jsx createElement */
import { getHighlightedParts } from 'instantsearch-core';

import { cx } from '../lib';

import { createHighlightComponent } from './Highlight';
import {
  createShowMoreButtonComponent,
  defaultShowMoreButtonTranslations,
} from './ShowMoreButton';

import type { ComponentProps, Renderer } from '../types';
import type { ShowMoreButtonTranslations } from './ShowMoreButton';

export type RefinementListItem = {
  /**
   * The value used to refine.
   */
  value: string;
  /**
   * The label to display.
   */
  label: string;
  /**
   * The label with highlight markers, from a search for facet values.
   */
  highlighted?: string;
  /**
   * Number of results matching this value.
   */
  count: number;
  /**
   * Whether the value is selected.
   */
  isRefined: boolean;
};

export type RefinementListClassNames = {
  /**
   * Class names to apply to the root element
   */
  root: string | string[];
  /**
   * Class names to apply to the root element when there are no refinements possible
   */
  noRefinementRoot: string | string[];
  /**
   * Class names to apply to the search box wrapper element
   */
  searchBox: string | string[];
  /**
   * Class names to apply to the no results element
   */
  noResults: string | string[];
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
   * Class names to apply to each label element
   */
  label: string | string[];
  /**
   * Class names to apply to each checkbox element
   */
  checkbox: string | string[];
  /**
   * Class names to apply to the text for each label
   */
  labelText: string | string[];
  /**
   * Class names to apply to the facet count of each item
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

export type RefinementListTranslations = ShowMoreButtonTranslations & {
  /**
   * What to display when a search for facet values has no results.
   */
  noResultsText: string;
};

export type RefinementListItemComponentProps = {
  item: RefinementListItem;
  /**
   * The computed class names of the `<li>` root.
   */
  className: string;
  /**
   * The default item content (label, checkbox, label text and count),
   * always provided. Render it to keep the default markup inside a custom root.
   */
  children?: JSX.Element;
  key?: string | number;
};

export type RefinementListProps = Omit<ComponentProps<'div'>, 'onChange'> & {
  items: RefinementListItem[];
  /**
   * Called when an item's checkbox changes. When omitted, the default
   * checkbox has no change handler and the consumer refines from its own
   * item root (the JS flavor handles clicks on the `<li>`).
   */
  onRefine?: (item: RefinementListItem) => void;
  /**
   * Whether the items come from a search for facet values. Labels are then
   * rendered highlighted.
   */
  isFromSearch?: boolean;
  /**
   * Renders the search box, placed inside `.ais-RefinementList-searchBox`.
   * It is called (not mounted) on every render so the flavor's own search
   * box keeps its identity and state across renders.
   */
  searchBoxComponent?: () => JSX.Element;
  /**
   * Whether to render the "no results" element instead of the list.
   */
  showNoResults?: boolean;
  /**
   * Overrides the content of the "no results" element.
   */
  noResultsComponent?: () => JSX.Element | null;
  /**
   * Overrides each item, including its `<li>` root.
   */
  itemComponent?: (props: RefinementListItemComponentProps) => JSX.Element;
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
  classNames?: Partial<RefinementListClassNames>;
  translations?: Partial<RefinementListTranslations>;
};

const defaultTranslations: RefinementListTranslations = {
  ...defaultShowMoreButtonTranslations,
  noResultsText: 'No results.',
};

export function createRefinementListComponent({
  createElement,
  Fragment,
}: Renderer) {
  const Highlight = createHighlightComponent({ createElement, Fragment });
  const ShowMoreButton = createShowMoreButtonComponent({
    createElement,
    Fragment,
  });

  function DefaultItemComponent({
    item: _item,
    children,
    ...rootProps
  }: RefinementListItemComponentProps) {
    return <li {...rootProps}>{children}</li>;
  }

  return function RefinementList(userProps: RefinementListProps) {
    const {
      items,
      onRefine,
      isFromSearch = false,
      searchBoxComponent,
      showNoResults = false,
      noResultsComponent,
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

    const translations = { ...defaultTranslations, ...userTranslations };

    return (
      <div
        {...props}
        className={cx(
          'ais-RefinementList',
          classNames.root,
          items.length === 0 &&
            cx('ais-RefinementList--noRefinement', classNames.noRefinementRoot),
          props.className
        )}
      >
        {searchBoxComponent && (
          <div
            className={cx('ais-RefinementList-searchBox', classNames.searchBox)}
          >
            {searchBoxComponent()}
          </div>
        )}
        {showNoResults ? (
          <div
            className={cx('ais-RefinementList-noResults', classNames.noResults)}
          >
            {noResultsComponent
              ? noResultsComponent()
              : translations.noResultsText}
          </div>
        ) : (
          items.length > 0 && (
            <ul className={cx('ais-RefinementList-list', classNames.list)}>
              {items.map((item) => (
                <ItemComponent
                  key={item.value}
                  item={item}
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
                      onChange={
                        onRefine
                          ? () => {
                              onRefine(item);
                            }
                          : undefined
                      }
                    />
                    <span
                      className={cx(
                        'ais-RefinementList-labelText',
                        classNames.labelText
                      )}
                    >
                      {isFromSearch ? (
                        <Highlight
                          classNames={{
                            root: 'ais-Highlight',
                            highlighted: 'ais-Highlight-highlighted',
                            nonHighlighted: 'ais-Highlight-nonHighlighted',
                            separator: 'ais-Highlight-separator',
                          }}
                          parts={[
                            getHighlightedParts(item.highlighted || item.label),
                          ]}
                        />
                      ) : (
                        item.label
                      )}
                    </span>
                    <span
                      className={cx(
                        'ais-RefinementList-count',
                        classNames.count
                      )}
                    >
                      {item.count.toLocaleString()}
                    </span>
                  </label>
                </ItemComponent>
              ))}
            </ul>
          )
        )}
        {showMore && (
          <ShowMoreButton
            widgetName="RefinementList"
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
