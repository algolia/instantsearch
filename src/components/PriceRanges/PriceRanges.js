import PropTypes from 'prop-types';
import React, { Component } from 'preact-compat';

import Template from '../Template.js';
import PriceRangesForm from './PriceRangesForm.js';
import cx from 'classnames';
import isEqual from 'lodash/isEqual';

import autoHideContainerHOC from '../../decorators/autoHideContainer.js';
import headerFooterHOC from '../../decorators/headerFooter.js';

export class RawPriceRanges extends Component {
  componentWillMount() {
    this.refine = this.refine.bind(this);
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.facetValues, nextProps.facetValues);
  }

  getForm() {
    const labels = {
      currency: this.props.currency,
      ...this.props.labels,
    };

    let currentRefinement;
    if (this.props.facetValues.length === 1) {
      currentRefinement = {
        from:
          this.props.facetValues[0].from !== undefined
            ? this.props.facetValues[0].from
            : '',
        to:
          this.props.facetValues[0].to !== undefined
            ? this.props.facetValues[0].to
            : '',
      };
    } else {
      currentRefinement = { from: '', to: '' };
    }

    return (
      <PriceRangesForm
        cssClasses={this.props.cssClasses}
        currentRefinement={currentRefinement}
        labels={labels}
        refine={this.refine}
      />
    );
  }

  getItemFromFacetValue(facetValue) {
    const cssClassItem = cx(this.props.cssClasses.item, {
      [this.props.cssClasses.active]: facetValue.isRefined,
    });
    const key = `${facetValue.from}_${facetValue.to}`;
    const handleClick = e => this.refine(facetValue, e);
    const data = {
      currency: this.props.currency,
      ...facetValue,
    };
    return (
      <div className={cssClassItem} key={key}>
        <a
          className={this.props.cssClasses.link}
          href={facetValue.url}
          onClick={handleClick}
        >
          <Template
            data={data}
            templateKey="item"
            {...this.props.templateProps}
          />
        </a>
      </div>
    );
  }

  refine(range, event) {
    event.preventDefault();
    this.props.refine(range);
  }

  render() {
    return (
      <div>
        <div className={this.props.cssClasses.list}>
          {this.props.facetValues.map(facetValue =>
            this.getItemFromFacetValue(facetValue)
          )}
        </div>
        {this.getForm()}
      </div>
    );
  }
}

RawPriceRanges.propTypes = {
  cssClasses: PropTypes.shape({
    active: PropTypes.string,
    button: PropTypes.string,
    form: PropTypes.string,
    input: PropTypes.string,
    item: PropTypes.string,
    label: PropTypes.string,
    link: PropTypes.string,
    list: PropTypes.string,
    separator: PropTypes.string,
  }),
  currency: PropTypes.string,
  facetValues: PropTypes.array,
  labels: PropTypes.shape({
    button: PropTypes.string,
    to: PropTypes.string,
  }),
  refine: PropTypes.func.isRequired,
  templateProps: PropTypes.object.isRequired,
};

RawPriceRanges.defaultProps = {
  cssClasses: {},
};

export default autoHideContainerHOC(headerFooterHOC(RawPriceRanges));
