/** @jsx h */

import { h } from 'preact';
import { useState } from 'preact/hooks';
import cx from 'classnames';
import { onRefinementItemClick } from '../../lib/onRefinementItemClick';
import List from '../List/List';
import Template from '../Template/Template';
import { Template as WidgetTemplate } from '../../types';

interface SharedRefinementListCSSClasses {
  root: string;
  noRefinementRoot: string;
  list: string;
  item: string;
  selectedItem: string;
  label: string;
}

interface SharedRefinementListTemplates {
  item: WidgetTemplate<any>;
}

interface SharedRefinementListItem {
  value: string;
  isRefined: boolean;
}

interface SharedRefinementListProps<TItem, TCSSClasses, TTemplates> {
  attribute?: string;
  canToggleShowMore?: boolean;
  // Children can be passed to inject content in the list.
  // Example: inject the RatingMenu star SVGs.
  children?: React.ReactNode;
  createURL(value: string): string;
  cssClasses: TCSSClasses;
  hasExhaustiveItems?: boolean;
  isFromSearch?: boolean;
  isShowingMore?: boolean;
  items: TItem[];
  searchFacetValues?(query: string): void;
  searchIsAlwaysActive?: boolean;
  searchPlaceholder?: string;
  showMore?: boolean;
  templateProps: {
    templates: TTemplates;
  };
  toggleRefinement(value: string): void;
  toggleShowMore?(): void;
}

function SharedRefinementList<
  TItem extends SharedRefinementListItem,
  TCSSClasses extends SharedRefinementListCSSClasses,
  TTemplates extends SharedRefinementListTemplates
>(props: SharedRefinementListProps<TItem, TCSSClasses, TTemplates>) {
  const [query, setQuery] = useState<string>('');

  function refine(item: SharedRefinementListItem) {
    setQuery('');
    props.toggleRefinement(item.value);
  }

  function renderItem(item: SharedRefinementListItem) {
    return (
      <li
        key={[item.value, item.isRefined].join(':')}
        className={cx(props.cssClasses.item, {
          [props.cssClasses.selectedItem]: item.isRefined,
        })}
        onClick={event => onRefinementItemClick(item, event, refine)}
      >
        <Template
          {...props.templateProps}
          templateKey="item"
          data={{
            ...item,
            url: props.createURL(item.value),
            cssClasses: props.cssClasses,
            attribute: props.attribute,
          }}
        />
      </li>
    );
  }

  const searchBoxIsEnabled =
    props.searchIsAlwaysActive === true ||
    !props.isFromSearch || !props.hasExhaustiveItems;

  return (
    <List
      canRefine={props.items.length > 0}
      canToggleShowMore={props.canToggleShowMore}
      cssClasses={props.cssClasses}
      isFromSearch={props.isFromSearch}
      isShowingMore={props.isShowingMore}
      items={props.items}
      refine={refine}
      query={query}
      renderItem={renderItem}
      searchBoxIsEnabled={searchBoxIsEnabled}
      searchFacetValues={props.searchFacetValues}
      searchPlaceholder={props.searchPlaceholder}
      showMore={props.showMore}
      templateProps={props.templateProps}
      toggleShowMore={props.toggleShowMore}
    >
      {props.children}
    </List>
  );
}

export default SharedRefinementList;
