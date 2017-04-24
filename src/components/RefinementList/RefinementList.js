import React from 'react';
import cx from 'classnames';
import {isSpecialClick} from '../../lib/utils.js';

import Template from '../Template.js';
import RefinementListItem from './RefinementListItem.js';
import isEqual from 'lodash/isEqual';

import SearchBox from '../SearchBox';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export class RawRefinementList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMoreOpen: false,
    };
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleClickShowMore = this.handleClickShowMore.bind(this);
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isStateDifferent = nextState !== this.state;
    const isFacetValuesDifferent = !isEqual(this.props.facetValues, nextProps.facetValues);
    const shouldUpdate = isStateDifferent || isFacetValuesDifferent;
    return shouldUpdate;
  }

  refine(facetValueToRefine, isRefined) {
    this.props.toggleRefinement(facetValueToRefine, isRefined);
  }

  _generateFacetItem(facetValue) {
    let subItems;
    const hasChildren = facetValue.data && facetValue.data.length > 0;
    if (hasChildren) {
      subItems = <RawRefinementList
                  {...this.props}
                  depth={this.props.depth + 1}
                  facetValues={facetValue.data}
                />;
    }

    const url = this.props.createURL(facetValue[this.props.attributeNameKey]);
    const templateData = {...facetValue, url, cssClasses: this.props.cssClasses};

    const cssClassItem = cx(this.props.cssClasses.item, {
      [this.props.cssClasses.active]: facetValue.isRefined,
    });

    let key = facetValue[this.props.attributeNameKey];
    if (facetValue.isRefined !== undefined) {
      key += `/${facetValue.isRefined}`;
    }

    if (facetValue.count !== undefined) {
      key += `/${facetValue.count}`;
    }

    return (
      <RefinementListItem
        facetValueToRefine={facetValue[this.props.attributeNameKey]}
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
  handleItemClick({facetValueToRefine, originalEvent, isRefined}) {
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
      if (parent.tagName === 'LABEL' && (parent.querySelector('input[type="checkbox"]')
          || parent.querySelector('input[type="radio"]'))) {
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

  handleClickShowMore() {
    const isShowMoreOpen = !this.state.isShowMoreOpen;
    this.setState({isShowMoreOpen});
  }

  componentWillReceiveProps(nextProps) {
    if (this.searchbox && !nextProps.isFromSearch) {
      this.searchbox.clearInput();
    }
  }

  refineFirstValue() {
    const firstValue = this.props.facetValues[0];
    if (firstValue) {
      const actualValue = firstValue[this.props.attributeNameKey];
      this.props.toggleRefinement(actualValue);
    }
  }

  render() {
    // Adding `-lvl0` classes
    const cssClassList = [this.props.cssClasses.list];
    if (this.props.cssClasses.depth) {
      cssClassList.push(`${this.props.cssClasses.depth}${this.props.depth}`);
    }

    const limit = this.state.isShowMoreOpen ? this.props.limitMax : this.props.limitMin;
    const displayedFacetValues = this.props.facetValues.slice(0, limit);
    const displayShowMore = this.props.showMore === true &&
      // "Show more"
      this.props.facetValues.length > displayedFacetValues.length ||
      // "Show less", but hide it if the result set changed
      this.state.isShowMoreOpen && displayedFacetValues.length > this.props.limitMin;

    const showMoreBtn = displayShowMore ?
        <Template
          rootProps={{onClick: this.handleClickShowMore}}
          templateKey={`show-more-${this.state.isShowMoreOpen ? 'active' : 'inactive'}`}
          {...this.props.templateProps}
        /> :
        undefined;

    const searchInput = this.props.searchFacetValues ?
      <SearchBox ref={i => { this.searchbox = i; }}
        placeholder={this.props.searchPlaceholder}
        onChange={this.props.searchFacetValues}
        onValidate={() => this.refineFirstValue()}/> :
      null;

    const noResults = this.props.searchFacetValues && this.props.isFromSearch && this.props.facetValues.length === 0 ?
      <Template
        templateKey={'noResults'}
        {...this.props.templateProps}
      /> :
      null;

    return (
      <div className={cx(cssClassList)}>
        {searchInput}
        {displayedFacetValues.map(this._generateFacetItem, this)}
        {noResults}
        {showMoreBtn}
      </div>
    );
  }
}

RawRefinementList.propTypes = {
  Template: React.PropTypes.func,
  attributeNameKey: React.PropTypes.string,
  createURL: React.PropTypes.func,
  cssClasses: React.PropTypes.shape({
    active: React.PropTypes.string,
    depth: React.PropTypes.string,
    item: React.PropTypes.string,
    list: React.PropTypes.string,
  }),
  depth: React.PropTypes.number,
  facetValues: React.PropTypes.array,
  limitMax: React.PropTypes.number,
  limitMin: React.PropTypes.number,
  showMore: React.PropTypes.bool,
  templateProps: React.PropTypes.object.isRequired,
  toggleRefinement: React.PropTypes.func.isRequired,
  searchFacetValues: React.PropTypes.func,
  searchPlaceholder: React.PropTypes.string,
  isFromSearch: React.PropTypes.bool,
};

RawRefinementList.defaultProps = {
  cssClasses: {},
  depth: 0,
  attributeNameKey: 'name',
};

export default autoHideContainerHOC(headerFooterHOC(RawRefinementList));
