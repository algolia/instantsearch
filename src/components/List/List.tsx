/** @jsx h */

import { h } from 'preact';
import cx from 'classnames';
import Template from '../Template/Template';
import SearchBox from '../SearchBox/SearchBox';

interface ListItem {
  value: string;
  isRefined: boolean;
  data?: ListItem[];
}

interface ListCSSClasses {
  root: string;
  noRefinementRoot: string;
  searchBox?: string;
  list: string;
  item: string;
  selectedItem: string;
  disabledItem?: string;
  parentItem?: string;
  noResults?: string;
  showMore?: string;
  disabledShowMore?: string;
  searchable?: {
    searchableRoot: string;
    searchableForm: string;
    searchableInput: string;
    searchableSubmit: string;
    searchableSubmitIcon: string;
    searchableReset: string;
    searchableResetIcon: string;
    searchableLoadingIndicator: string;
    searchableLoadingIcon: string;
  };
}

interface ListProps {
  canRefine: boolean;
  canToggleShowMore?: boolean;
  children?: React.ReactNode;
  cssClasses: ListCSSClasses;
  isFromSearch?: boolean;
  isShowingMore?: boolean;
  items: ListItem[];
  query?: string;
  refine(item: ListItem): void;
  renderItem(item: ListItem): React.ReactNode;
  searchBoxIsEnabled?: boolean;
  searchFacetValues?(query: string): void;
  searchPlaceholder?: string;
  showMore?: boolean;
  templateProps: any;
  toggleShowMore?(): void;
}

function List(props: ListProps) {
  return (
    <div
      className={cx(props.cssClasses.root, {
        [props.cssClasses.noRefinementRoot]: props.items.length === 0,
      })}
    >
      {props.children}

      {props.searchFacetValues && (
        <div className={props.cssClasses.searchBox}>
          <SearchBox
            placeholder={props.searchPlaceholder}
            disabled={!props.searchBoxIsEnabled}
            cssClasses={props.cssClasses.searchable}
            templates={props.templateProps.templates}
            onChange={(event: KeyboardEvent) =>
              props.searchFacetValues!((event.target as HTMLInputElement).value)
            }
            onReset={() => props.searchFacetValues!('')}
            onSubmit={() => {
              if (props.items.length > 0) {
                // Hitting `enter` should refine the first item in the list
                props.refine(props.items[0]);
              }
            }}
            // This sets the search box to a controlled state because
            // we don't rely on the `refine` prop but on `onChange`.
            searchAsYouType={false}
          />
        </div>
      )}

      {props.items.length > 0 && (
        <ul className={props.cssClasses.list}>
          {props.items.map(item => props.renderItem(item))}
        </ul>
      )}

      {props.searchFacetValues &&
        props.isFromSearch &&
        props.items.length === 0 && (
          <Template
            {...props.templateProps}
            templateKey="searchableNoResults"
            rootProps={{ className: props.cssClasses.noResults }}
          />
        )}

      {props.showMore && (
        <Template
          {...props.templateProps}
          templateKey="showMoreText"
          rootTagName="button"
          rootProps={{
            className: cx(props.cssClasses.showMore, {
              [props.cssClasses.disabledShowMore!]: !props.canToggleShowMore,
            }),
            disabled: !props.canToggleShowMore,
            onClick: props.toggleShowMore,
          }}
          data={{
            isShowingMore: props.isShowingMore,
          }}
        />
      )}
    </div>
  );
}

export default List;
