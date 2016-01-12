import React from 'react';
import cx from 'classnames';
import {isSpecialClick} from '../../lib/utils.js';

import Template from '../Template.js';

class RefinementList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isShowMoreOpen: false
    };
  }

  refine(value) {
    this.props.toggleRefinement(value);
  }

  _generateFacetItem(facetValue) {
    let subList;
    let hasChildren = facetValue.data && facetValue.data.length > 0;
    if (hasChildren) {
      subList = (
        <RefinementList
          {...this.props}
          depth={this.props.depth + 1}
          facetValues={facetValue.data}
        />
      );
    }
    let data = facetValue;

    if (this.props.createURL) {
      data.url = this.props.createURL(facetValue[this.props.attributeNameKey]);
    }

    let templateData = {...facetValue, cssClasses: this.props.cssClasses};

    let cssClassItem = cx(this.props.cssClasses.item, {
      [this.props.cssClasses.active]: facetValue.isRefined
    });

    let key = facetValue[this.props.attributeNameKey];
    if (facetValue.isRefined !== undefined) {
      key += '/' + facetValue.isRefined;
    }

    if (facetValue.count !== undefined) {
      key += '/' + facetValue.count;
    }
    return (
      <div
        className={cssClassItem}
        key={key}
        onClick={this.handleItemClick.bind(this, facetValue[this.props.attributeNameKey])}
      >
        <Template data={templateData} templateKey="item" {...this.props.templateProps} />
        {subList}
      </div>
    );
  }

  // Click events on DOM tree like LABEL > INPUT will result in two click events
  // instead of one. No matter the framework: see
  // a label, you will get two click events instead of one.
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
  handleItemClick(value, e) {
    if (isSpecialClick(e)) {
      // do not alter the default browser behavior
      // if one special key is down
      return;
    }

    if (e.target.tagName === 'INPUT') {
      this.refine(value);
      return;
    }

    let parent = e.target;

    while (parent !== e.currentTarget) {
      if (parent.tagName === 'LABEL' && (parent.querySelector('input[type="checkbox"]')
          || parent.querySelector('input[type="radio"]'))) {
        return;
      }

      if (parent.tagName === 'A' && parent.href) {
        e.preventDefault();
      }

      parent = parent.parentNode;
    }

    e.stopPropagation();

    this.refine(value);
  }

  handleClickShowMore() {
    const isShowMoreOpen = !this.state.isShowMoreOpen;
    this.setState({isShowMoreOpen});
  }

  render() {
    // Adding `-lvl0` classes
    let cssClassList = [this.props.cssClasses.list];
    if (this.props.cssClasses.depth) {
      cssClassList.push(`${this.props.cssClasses.depth}${this.props.depth}`);
    }

    const limit = this.state.isShowMoreOpen ? this.props.limitMax : this.props.limitMin;
    const showmoreBtn =
      this.props.showMore ?
        <Template
          onClick={() => this.handleClickShowMore()}
          templateKey={'showmore-' + (this.state.isShowMoreOpen ? 'active' : 'inactive')}
          {...this.props.templateProps}
        /> :
        undefined;

    return (
      <div className={cx(cssClassList)}>
        {this.props.facetValues.map(this._generateFacetItem, this).slice(0, limit)}
        {showmoreBtn}
      </div>
    );
  }
}

RefinementList.propTypes = {
  Template: React.PropTypes.func,
  attributeNameKey: React.PropTypes.string,
  createURL: React.PropTypes.func.isRequired,
  cssClasses: React.PropTypes.shape({
    active: React.PropTypes.string,
    depth: React.PropTypes.string,
    item: React.PropTypes.string,
    list: React.PropTypes.string
  }),
  depth: React.PropTypes.number,
  facetValues: React.PropTypes.array,
  limitMax: React.PropTypes.number,
  limitMin: React.PropTypes.number,
  showMore: React.PropTypes.bool,
  templateProps: React.PropTypes.object.isRequired,
  toggleRefinement: React.PropTypes.func.isRequired
};

RefinementList.defaultProps = {
  cssClasses: {},
  depth: 0,
  attributeNameKey: 'name'
};

export default RefinementList;
