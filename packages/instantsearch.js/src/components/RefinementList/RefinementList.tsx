/** @jsx h */

import { isSpecialClick, isEqual } from 'instantsearch-core/internal';
import { cx } from 'instantsearch-ui-components';
import { h, createRef, Component } from 'preact';

import Template from '../Template/Template';

import RefinementListItem from './RefinementListItem';

import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Templates } from '../../types';
import type { HierarchicalMenuComponentCSSClasses } from '../../widgets/hierarchical-menu/hierarchical-menu';
import type { RatingMenuComponentCSSClasses } from '../../widgets/rating-menu/rating-menu';
import type { RefinementListOwnCSSClasses } from '../../widgets/refinement-list/refinement-list';
import type { SearchBoxComponentCSSClasses } from '../../widgets/search-box/search-box';
import type { HierarchicalMenuItem } from 'instantsearch-core';
import type { CreateURL } from 'instantsearch-core';
import type { JSX } from 'preact';

// CSS types
type RefinementListOptionalClasses =
  | 'noResults'
  | 'checkbox'
  | 'labelText'
  | 'showMore'
  | 'disabledShowMore'
  | 'searchBox'
  | 'count';

type RefinementListWidgetCSSClasses =
  ComponentCSSClasses<RefinementListOwnCSSClasses>;

type RefinementListRequiredCSSClasses = Omit<
  RefinementListWidgetCSSClasses,
  RefinementListOptionalClasses
> &
  Partial<Pick<RefinementListWidgetCSSClasses, RefinementListOptionalClasses>>;

export type RefinementListComponentCSSClasses =
  RefinementListRequiredCSSClasses & {
    searchable?: Partial<SearchBoxComponentCSSClasses>;
  } & Partial<Pick<RatingMenuComponentCSSClasses, 'disabledItem'>> &
    Partial<
      Pick<HierarchicalMenuComponentCSSClasses, 'childList' | 'parentItem'>
    >;

type FacetValue = {
  value: string;
  label: string;
  highlighted?: string;
  count?: number;
  isRefined: boolean;
  data?: HierarchicalMenuItem[] | null;
};

export type RefinementListProps<TTemplates extends Templates> = {
  createURL: CreateURL<string>;
  cssClasses: RefinementListComponentCSSClasses;
  depth?: number;
  facetValues?: FacetValue[];
  attribute?: string;
  templateProps: PreparedTemplateProps<TTemplates>;
  toggleRefinement: (value: string) => void;
  showMore?: boolean;
  showMoreButtonLabel?: string;
  toggleShowMore?: () => void;
  isShowingMore?: boolean;
  hasExhaustiveItems?: boolean;
  canToggleShowMore?: boolean;
  className?: string;
  children?: JSX.Element;
  isFromSearch?: boolean;
};

const defaultProps = {
  cssClasses: {},
  depth: 0,
};

type RefinementListPropsWithDefaultProps<TTemplates extends Templates> =
  RefinementListProps<TTemplates> & Readonly<typeof defaultProps>;

type RefinementListItemTemplateData<TTemplates extends Templates> =
  FacetValue & {
    url: string;
  } & Pick<
      RefinementListProps<TTemplates>,
      'attribute' | 'cssClasses' | 'isFromSearch'
    >;

function isHierarchicalMenuItem(
  facetValue: FacetValue
): facetValue is HierarchicalMenuItem {
  return (facetValue as HierarchicalMenuItem).data !== undefined;
}

class RefinementList<TTemplates extends Templates> extends Component<
  RefinementListPropsWithDefaultProps<TTemplates>
> {
  public static defaultProps = defaultProps;

  private listRef = createRef<HTMLUListElement>();

  private lastRefinedValue: string | undefined = undefined;

  public shouldComponentUpdate(
    nextProps: RefinementListPropsWithDefaultProps<TTemplates>
  ) {
    const areFacetValuesDifferent = !isEqual(
      this.props.facetValues,
      nextProps.facetValues
    );

    return areFacetValuesDifferent;
  }

  private refine(facetValueToRefine: string) {
    this.lastRefinedValue = facetValueToRefine;
    this.props.toggleRefinement(facetValueToRefine);
  }

  private _generateFacetItem = (facetValue: FacetValue) => {
    let subItems;
    if (
      isHierarchicalMenuItem(facetValue) &&
      Array.isArray(facetValue.data) &&
      facetValue.data.length > 0
    ) {
      const { root, ...cssClasses } = this.props.cssClasses;

      subItems = (
        <RefinementList
          {...this.props}
          // We want to keep `root` required for external usage but not for the
          // sub items.
          cssClasses={cssClasses as RefinementListComponentCSSClasses}
          depth={this.props.depth + 1}
          facetValues={facetValue.data}
          showMore={false}
          className={this.props.cssClasses.childList}
        />
      );
    }

    const url = this.props.createURL(facetValue.value);
    const templateData: RefinementListItemTemplateData<TTemplates> = {
      ...facetValue,
      url,
      attribute: this.props.attribute,
      cssClasses: this.props.cssClasses,
      isFromSearch: this.props.isFromSearch,
    };

    let { value: key } = facetValue;
    if (facetValue.isRefined !== undefined) {
      key += `/${facetValue.isRefined}`;
    }

    if (facetValue.count !== undefined) {
      key += `/${facetValue.count}`;
    }

    const refinementListItemClassName = cx(
      this.props.cssClasses.item,
      facetValue.isRefined && this.props.cssClasses.selectedItem,
      !facetValue.count && this.props.cssClasses.disabledItem,
      Boolean(
        isHierarchicalMenuItem(facetValue) &&
        Array.isArray(facetValue.data) &&
        facetValue.data.length > 0
      ) && this.props.cssClasses.parentItem!
    );

    return (
      <RefinementListItem
        templateKey="item"
        key={key}
        facetValueToRefine={facetValue.value}
        handleClick={this.handleItemClick}
        isRefined={facetValue.isRefined}
        className={refinementListItemClassName}
        subItems={subItems}
        templateData={templateData}
        templateProps={this.props.templateProps}
      />
    );
  };

  // Click events on DOM tree like LABEL > INPUT will result in two click events
  // instead of one.
  // No matter the framework, see https://www.google.com/search?q=click+label+twice
  //
  // Thus making it hard to distinguish activation from deactivation because both click events
  // are very close. Debounce is a solution but hacky.
  //
  // So the code here checks if the click was done on or in a LABEL. If this LABEL
  // has a checkbox inside, we ignore the first click event because we will get another one.
  //
  // We also check if the click was done inside a link and then e.preventDefault() because we already
  // handle the url
  //
  // Finally, we always stop propagation of the event to avoid multiple levels RefinementLists to fail: click
  // on child would click on parent also
  private handleItemClick = ({
    facetValueToRefine,
    isRefined,
    originalEvent,
  }: {
    facetValueToRefine: string;
    isRefined: boolean;
    originalEvent: MouseEvent;
  }) => {
    if (isSpecialClick(originalEvent)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }

    let parent = originalEvent.target as HTMLElement | null;

    if (parent === null || parent.parentNode === null) {
      return;
    }

    if (
      isRefined &&
      parent.parentNode.querySelector('input[type="radio"]:checked')
    ) {
      // Prevent refinement for being reset if the user clicks on an already checked radio button
      return;
    }

    if (parent.tagName === 'INPUT') {
      this.refine(facetValueToRefine);
      return;
    }

    while (parent !== originalEvent.currentTarget) {
      if (
        parent.tagName === 'LABEL' &&
        (parent.querySelector('input[type="checkbox"]') ||
          parent.querySelector('input[type="radio"]'))
      ) {
        return;
      }

      if (parent.tagName === 'A' && (parent as HTMLAnchorElement).href) {
        originalEvent.preventDefault();
      }

      parent = parent.parentNode as HTMLElement;
    }

    originalEvent.stopPropagation();

    this.refine(facetValueToRefine);
  };

  /**
   * This sets focus on the last refined input element after a render
   * because Preact does not perform it automatically.
   * @see https://github.com/preactjs/preact/issues/3242
   */
  public componentDidUpdate() {
    const inputs = this.listRef.current?.getElementsByTagName('input') || [];
    for (let i = 0; i < inputs.length; i++) {
      if (inputs[i].value === this.lastRefinedValue) {
        inputs[i].focus();
        break;
      }
    }
    this.lastRefinedValue = undefined;
  }

  public render() {
    const showMoreButtonClassName = cx(
      this.props.cssClasses.showMore,
      !(this.props.showMore === true && this.props.canToggleShowMore) &&
        this.props.cssClasses.disabledShowMore
    );

    const showMoreButton = this.props.showMore === true && (
      <Template
        {...this.props.templateProps}
        templateKey="showMoreText"
        rootTagName="button"
        rootProps={{
          className: showMoreButtonClassName,
          disabled: !this.props.canToggleShowMore,
          onClick: this.props.toggleShowMore,
          'aria-expanded': Boolean(this.props.isShowingMore),
          'aria-label': this.props.showMoreButtonLabel,
        }}
        data={{
          isShowingMore: this.props.isShowingMore,
        }}
      />
    );

    const facetValues = this.props.facetValues &&
      this.props.facetValues.length > 0 && (
        <ul ref={this.listRef} className={this.props.cssClasses.list}>
          {this.props.facetValues.map(this._generateFacetItem, this)}
        </ul>
      );

    const rootClassName = cx(
      this.props.cssClasses.root,
      (!this.props.facetValues || this.props.facetValues.length === 0) &&
        this.props.cssClasses.noRefinementRoot,
      this.props.className
    );

    return (
      <div className={rootClassName}>
        {this.props.children}
        {facetValues}
        {showMoreButton}
      </div>
    );
  }
}

export default RefinementList;
