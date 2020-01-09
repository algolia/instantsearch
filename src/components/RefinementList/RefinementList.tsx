/** @jsx h */

import { h } from 'preact';
import { Template as WidgetTemplate } from '../../types';
import SharedRefinementList from '../SharedRefinementList/SharedRefinementList';

interface RefinementListCSSClasses {
  root: string;
  noRefinementRoot: string;
  noResults: string;
  list: string;
  item: string;
  selectedItem: string;
  label: string;
  checkbox: string;
  labelText: string;
  showMore: string;
  disabledShowMore: string;
  count: string;
  searchBox: string;
  searchable: {
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

interface RefinementListTemplates {
  item: WidgetTemplate<{
    value: string;
    label: string;
    isRefined: boolean;
    count: number;
    attribute: string;
    url: string;
    cssClasses: RefinementListCSSClasses;
  }>;
  showMoreText: WidgetTemplate<{ isShowingMore: boolean }>;
  searchableNoResults: WidgetTemplate;
  reset: WidgetTemplate<{ cssClasses: object }>;
  submit: WidgetTemplate<{ cssClasses: object }>;
  loadingIndicator: WidgetTemplate<{ cssClasses: object }>;
}

interface RefinementListItem {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
}

interface RefinementListProps {
  attribute: string;
  canToggleShowMore: boolean;
  createURL(value: string): string;
  cssClasses: RefinementListCSSClasses;
  hasExhaustiveItems: boolean;
  isFromSearch: boolean;
  isShowingMore: boolean;
  items: RefinementListItem[];
  searchFacetValues?(query: string): void;
  searchIsAlwaysActive: boolean;
  searchPlaceholder: string;
  showMore: boolean;
  templateProps: {
    templates: RefinementListTemplates;
  };
  toggleRefinement(value: string): void;
  toggleShowMore(): void;
}

function RefinementList(props: RefinementListProps) {
  return (
    <SharedRefinementList
      attribute={props.attribute}
      canToggleShowMore={props.canToggleShowMore}
      createURL={props.createURL}
      cssClasses={props.cssClasses}
      isFromSearch={props.isFromSearch}
      isShowingMore={props.isShowingMore}
      items={props.items}
      searchFacetValues={props.searchFacetValues}
      searchPlaceholder={props.searchPlaceholder}
      showMore={props.showMore}
      templateProps={props.templateProps}
      toggleRefinement={props.toggleRefinement}
      toggleShowMore={props.toggleShowMore}
    />
  );
}

export default RefinementList;
