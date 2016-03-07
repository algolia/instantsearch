import React from 'react';

import Template from '../Template.js';
import PriceRangesForm from './PriceRangesForm.js';
import cx from 'classnames';
import isEqual from 'lodash/lang/isEqual';

class PriceRanges extends React.Component {
  componentWillMount() {
    this.refine = this.refine.bind(this);
    this.form = this.getForm();
  }

  shouldComponentUpdate(nextProps) {
    return !isEqual(this.props.facetValues, nextProps.facetValues);
  }

  getForm() {
    let labels = {
      currency: this.props.currency,
      ...this.props.labels
    };

    return (
      <PriceRangesForm
        cssClasses={this.props.cssClasses}
        labels={labels}
        refine={this.refine}
      />
    );
  }

  getItemFromFacetValue(facetValue) {
    let cssClassItem = cx(
      this.props.cssClasses.item,
      {[this.props.cssClasses.active]: facetValue.isRefined}
    );
    let key = facetValue.from + '_' + facetValue.to;
    let handleClick = this.refine.bind(this, facetValue.from, facetValue.to);
    let data = {
      currency: this.props.currency,
      ...facetValue
    };
    return (
      <div className={cssClassItem} key={key}>
        <a
          className={this.props.cssClasses.link}
          href={facetValue.url}
          onClick={handleClick}
        >
          <Template data={data} templateKey="item" {...this.props.templateProps} />
        </a>
      </div>
    );
  }

  refine(from, to, event) {
    event.preventDefault();
    this.props.refine(from, to);
  }

  render() {
    return (
      <div>
        <div className={this.props.cssClasses.list}>
          {this.props.facetValues.map(facetValue => {
            return this.getItemFromFacetValue(facetValue);
          })}
        </div>
        {this.form}
      </div>
    );
  }
}

PriceRanges.propTypes = {
  cssClasses: React.PropTypes.shape({
    active: React.PropTypes.string,
    button: React.PropTypes.string,
    form: React.PropTypes.string,
    input: React.PropTypes.string,
    item: React.PropTypes.string,
    label: React.PropTypes.string,
    link: React.PropTypes.string,
    list: React.PropTypes.string,
    separator: React.PropTypes.string
  }),
  currency: React.PropTypes.string,
  facetValues: React.PropTypes.array,
  labels: React.PropTypes.shape({
    button: React.PropTypes.string,
    to: React.PropTypes.string
  }),
  refine: React.PropTypes.func.isRequired,
  templateProps: React.PropTypes.object.isRequired
};

PriceRanges.defaultProps = {
  cssClasses: {}
};

export default PriceRanges;
