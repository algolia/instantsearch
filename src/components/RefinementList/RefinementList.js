import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';
import cx from 'classnames';
import { isSpecialClick } from '../../lib/utils.js';

import Template from '../Template.js';
import RefinementListItem from './RefinementListItem.js';
import isEqual from 'lodash/isEqual';

import SearchBox from '../SearchBox';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export class RawRefinementList extends Component {
  constructor(props) {
    super(props);
    this.handleItemClick = this.handleItemClick.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isStateDifferent = nextState !== this.state;
    const isFacetValuesDifferent = !isEqual(
      this.props.facetValues,
      nextProps.facetValues
    );
    const shouldUpdate = isStateDifferent || isFacetValuesDifferent;
    return shouldUpdate;
  }

  refine(facetValueToRefine, isRefined) {
    this.props.toggleFacetRefinement(facetValueToRefine, isRefined);
  }

  _generateFacetItem(facetValue) {
    let subItems;
    const hasChildren = facetValue.data && facetValue.data.length > 0;
    if (hasChildren) {
      subItems = (
        <RawRefinementList
          {...this.props}
          depth={this.props.depth + 1}
          facetValues={facetValue.data}
        />
      );
    }

    const url = this.props.createURL(facetValue.value);
    const templateData = {
      ...facetValue,
      url,
      cssClasses: this.props.cssClasses,
    };

    const cssClassItem = cx(this.props.cssClasses.item, {
      [this.props.cssClasses.active]: facetValue.isRefined,
    });

    let { value: key } = facetValue;
    if (facetValue.isRefined !== undefined) {
      key += `/${facetValue.isRefined}`;
    }

    if (facetValue.count !== undefined) {
      key += `/${facetValue.count}`;
    }

    return (
      <RefinementListItem
        facetValueToRefine={facetValue.value}
        handleClick={this.handleItemClick}
        isRefined={facetValue.isRefined}
        itemClassName={cssClassItem}
        key={key}
        subItems={subItems}
        templateData={templateData}
        templateKey="item"
        templateProps={this.props.templateProps}
      />
    );
  }

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
  handleItemClick({ facetValueToRefine, originalEvent, isRefined }) {
    if (isSpecialClick(originalEvent)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }

    if (originalEvent.target.tagName === 'INPUT') {
      this.refine(facetValueToRefine, isRefined);
      return;
    }

    let parent = originalEvent.target;

    while (parent !== originalEvent.currentTarget) {
      if (
        parent.tagName === 'LABEL' &&
        (parent.querySelector('input[type="checkbox"]') ||
          parent.querySelector('input[type="radio"]'))
      ) {
        return;
      }

      if (parent.tagName === 'A' && parent.href) {
        originalEvent.preventDefault();
      }

      parent = parent.parentNode;
    }

    originalEvent.stopPropagation();

    this.refine(facetValueToRefine, isRefined);
  }

  componentWillReceiveProps(nextProps) {
    if (this.searchbox && !nextProps.isFromSearch) {
      this.searchbox.clearInput();
    }
  }

  refineFirstValue() {
    const firstValue = this.props.facetValues[0];
    if (firstValue) {
      const actualValue = firstValue.value;
      this.props.toggleFacetRefinement(actualValue);
    }
  }

  render() {
    // Adding `-lvl0` classes
    const cssClassList = [this.props.cssClasses.list];
    if (this.props.cssClasses.depth) {
      cssClassList.push(`${this.props.cssClasses.depth}${this.props.depth}`);
    }

    const showMoreBtn =
      this.props.showMore === true && this.props.canToggleShowMore ? (
        <Template
          rootProps={{ onClick: this.props.toggleShowMore }}
          templateKey={`show-more-${
            this.props.isShowingMore ? 'active' : 'inactive'
          }`}
          {...this.props.templateProps}
        />
      ) : (
        undefined
      );

    const shouldDisableSearchInput =
      this.props.searchIsAlwaysActive !== true &&
      !(this.props.isFromSearch || !this.props.hasExhaustiveItems);
    const searchInput = this.props.searchFacetValues ? (
      <SearchBox
        ref={i => {
          this.searchbox = i;
        }}
        placeholder={this.props.searchPlaceholder}
        onChange={this.props.searchFacetValues}
        onValidate={() => this.refineFirstValue()}
        disabled={shouldDisableSearchInput}
      />
    ) : null;

    const noResults =
      this.props.searchFacetValues &&
      this.props.isFromSearch &&
      this.props.facetValues.length === 0 ? (
        <Template templateKey={'noResults'} {...this.props.templateProps} />
      ) : null;

    return (
      <div className={cx(cssClassList)}>
        {searchInput}
        {this.props.facetValues.map(this._generateFacetItem, this)}
        {noResults}
        {showMoreBtn}
      </div>
    );
  }
}

RawRefinementList.propTypes = {
  Template: PropTypes.func,
  createURL: PropTypes.func,
  cssClasses: PropTypes.shape({
    active: PropTypes.string,
    depth: PropTypes.string,
    item: PropTypes.string,
    list: PropTypes.string,
  }),
  depth: PropTypes.number,
  facetValues: PropTypes.array,
  templateProps: PropTypes.object.isRequired,
  toggleFacetRefinement: PropTypes.func.isRequired,
  searchFacetValues: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  isFromSearch: PropTypes.bool,
  showMore: PropTypes.bool,
  toggleShowMore: PropTypes.func,
  isShowingMore: PropTypes.bool,
  hasExhaustiveItems: PropTypes.bool,
  canToggleShowMore: PropTypes.bool,
  searchIsAlwaysActive: PropTypes.bool,
};

RawRefinementList.defaultProps = {
  cssClasses: {},
  depth: 0,
};

export default autoHideContainerHOC(headerFooterHOC(RawRefinementList));
