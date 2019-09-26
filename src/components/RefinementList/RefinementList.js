import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { isSpecialClick, isEqual } from '../../lib/utils';
import Template from '../Template/Template';
import RefinementListItem from './RefinementListItem';
import SearchBox from '../SearchBox/SearchBox';

class RefinementList extends Component {
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
    this.props.toggleRefinement(facetValueToRefine, isRefined);
  }

  _generateFacetItem(facetValue) {
    let subItems;
    const hasChildren = facetValue.data && facetValue.data.length > 0;
    if (hasChildren) {
      const { root, ...cssClasses } = this.props.cssClasses;
      subItems = (
        <RefinementList
          {...this.props}
          cssClasses={cssClasses}
          depth={this.props.depth + 1}
          facetValues={facetValue.data}
          showMore={false}
          className={this.props.cssClasses.childList}
        />
      );
    }

    const url = this.props.createURL(facetValue.value);
    const templateData = {
      ...facetValue,
      url,
      attribute: this.props.attribute,
      cssClasses: this.props.cssClasses,
    };

    let { value: key } = facetValue;
    if (facetValue.isRefined !== undefined) {
      key += `/${facetValue.isRefined}`;
    }

    if (facetValue.count !== undefined) {
      key += `/${facetValue.count}`;
    }

    return (
      <RefinementListItem
        templateKey="item"
        key={key}
        facetValueToRefine={facetValue.value}
        handleClick={this.handleItemClick}
        isRefined={facetValue.isRefined}
        className={cx(this.props.cssClasses.item, {
          [this.props.cssClasses.selectedItem]: facetValue.isRefined,
          [this.props.cssClasses.disabledItem]: !facetValue.count,
          [this.props.cssClasses.parentItem]: hasChildren,
        })}
        subItems={subItems}
        templateData={templateData}
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

    if (
      isRefined &&
      originalEvent.target.parentNode.querySelector(
        'input[type="radio"]:checked'
      )
    ) {
      // Prevent refinement for being reset if the user clicks on an already checked radio button
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
    if (this.searchBox && !nextProps.isFromSearch) {
      this.searchBox.resetInput();
    }
  }

  refineFirstValue() {
    const firstValue = this.props.facetValues[0];
    if (firstValue) {
      const actualValue = firstValue.value;
      this.props.toggleRefinement(actualValue);
    }
  }

  render() {
    // Adding `-lvl0` classes
    const cssClassList = cx(this.props.cssClasses.list, {
      [`${this.props.cssClasses.depth}${this.props.depth}`]: this.props
        .cssClasses.depth,
    });

    const showMoreButtonClassName = cx(this.props.cssClasses.showMore, {
      [this.props.cssClasses.disabledShowMore]: !(
        this.props.showMore === true && this.props.canToggleShowMore
      ),
    });

    const showMoreButton = this.props.showMore === true && (
      <Template
        {...this.props.templateProps}
        templateKey="showMoreText"
        rootTagName="button"
        rootProps={{
          className: showMoreButtonClassName,
          disabled: !this.props.canToggleShowMore,
          onClick: this.props.toggleShowMore,
        }}
        data={{
          isShowingMore: this.props.isShowingMore,
        }}
      />
    );

    const shouldDisableSearchBox =
      this.props.searchIsAlwaysActive !== true &&
      !(this.props.isFromSearch || !this.props.hasExhaustiveItems);

    const searchBox = this.props.searchFacetValues && (
      <div className={this.props.cssClasses.searchBox}>
        <SearchBox
          ref={searchBoxRef => (this.searchBox = searchBoxRef)}
          placeholder={this.props.searchPlaceholder}
          disabled={shouldDisableSearchBox}
          cssClasses={this.props.cssClasses.searchable}
          templates={this.props.templateProps.templates}
          onChange={event => this.props.searchFacetValues(event.target.value)}
          onReset={() => this.props.searchFacetValues('')}
          onSubmit={() => this.refineFirstValue()}
          // This sets the search box to a controlled state because
          // we don't rely on the `refine` prop but on `onChange`.
          searchAsYouType={false}
        />
      </div>
    );

    const facetValues = this.props.facetValues &&
      this.props.facetValues.length > 0 && (
        <ul className={cssClassList}>
          {this.props.facetValues.map(this._generateFacetItem, this)}
        </ul>
      );

    const noResults = this.props.searchFacetValues &&
      this.props.isFromSearch &&
      this.props.facetValues.length === 0 && (
        <Template
          {...this.props.templateProps}
          templateKey="searchableNoResults"
          rootProps={{ className: this.props.cssClasses.noResults }}
        />
      );

    return (
      <div
        className={cx(
          this.props.cssClasses.root,
          {
            [this.props.cssClasses.noRefinementRoot]:
              !this.props.facetValues || this.props.facetValues.length === 0,
          },
          this.props.className
        )}
      >
        {this.props.children}
        {searchBox}
        {facetValues}
        {noResults}
        {showMoreButton}
      </div>
    );
  }
}

RefinementList.propTypes = {
  Template: PropTypes.func,
  createURL: PropTypes.func,
  cssClasses: PropTypes.shape({
    depth: PropTypes.string,
    root: PropTypes.string,
    noRefinementRoot: PropTypes.string,
    list: PropTypes.string,
    item: PropTypes.string,
    selectedItem: PropTypes.string,
    parentItem: PropTypes.string,
    childList: PropTypes.string,
    searchBox: PropTypes.string,
    label: PropTypes.string,
    checkbox: PropTypes.string,
    labelText: PropTypes.string,
    count: PropTypes.string,
    noResults: PropTypes.string,
    showMore: PropTypes.string,
    disabledShowMore: PropTypes.string,
    disabledItem: PropTypes.string,
    searchable: PropTypes.shape({
      root: PropTypes.string,
      form: PropTypes.string,
      input: PropTypes.string,
      submit: PropTypes.string,
      submitIcon: PropTypes.string,
      reset: PropTypes.string,
      resetIcon: PropTypes.string,
      loadingIndicator: PropTypes.string,
      loadingIcon: PropTypes.string,
    }),
  }).isRequired,
  depth: PropTypes.number,
  facetValues: PropTypes.array,
  attribute: PropTypes.string,
  templateProps: PropTypes.object.isRequired,
  toggleRefinement: PropTypes.func.isRequired,
  searchFacetValues: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  isFromSearch: PropTypes.bool,
  showMore: PropTypes.bool,
  toggleShowMore: PropTypes.func,
  isShowingMore: PropTypes.bool,
  hasExhaustiveItems: PropTypes.bool,
  canToggleShowMore: PropTypes.bool,
  searchIsAlwaysActive: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.element,
};

RefinementList.defaultProps = {
  cssClasses: {},
  depth: 0,
};

export default RefinementList;
