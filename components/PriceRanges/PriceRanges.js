let React = require('react');

let Template = require('../Template');
let PriceRangesForm = require('./PriceRangesForm');
let cx = require('classnames');

class PriceRanges extends React.Component {
  getForm() {
    return (
      <PriceRangesForm
        cssClasses={this.props.cssClasses}
        labels={this.props.labels}
        refine={this.refine.bind(this)}
      />
    );
  }

  getURLFromFacetValue(facetValue) {
    if (!this.props.createURL) {
      return '#';
    }
    return this.props.createURL(facetValue.from, facetValue.to, facetValue.isRefined);
  }

  getItemFromFacetValue(facetValue) {
    let cssClassItem = cx(
      this.props.cssClasses.item,
      {[this.props.cssClasses.active]: facetValue.isRefined}
    );
    let url = this.getURLFromFacetValue(facetValue);
    let key = facetValue.from + '_' + facetValue.to;
    let handleClick = this.refine.bind(this, facetValue.from, facetValue.to);
    return (
      <div className={cssClassItem} key={key}>
        <a
          className={this.props.cssClasses.link}
          href={url}
          onClick={handleClick}
        >
          <Template data={facetValue} templateKey="item" {...this.props.templateProps} />
        </a>
      </div>
    );
  }

  refine(from, to, event) {
    event.preventDefault();
    this.setState({
      formFromValue: null,
      formToValue: null
    });
    this.props.refine(from, to);
  }

  render() {
    let form = this.getForm();
    return (
      <div>
        <div className={this.props.cssClasses.list}>
          {this.props.facetValues.map(facetValue => {
            return this.getItemFromFacetValue(facetValue);
          })}
        </div>
        {form}
      </div>
    );
  }
}

PriceRanges.propTypes = {
  createURL: React.PropTypes.func.isRequired,
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
  facetValues: React.PropTypes.array,
  labels: React.PropTypes.shape({
    button: React.PropTypes.string,
    currency: React.PropTypes.string,
    to: React.PropTypes.string
  }),
  refine: React.PropTypes.func.isRequired,
  templateProps: React.PropTypes.object.isRequired
};

PriceRanges.defaultProps = {
  cssClasses: {}
};

module.exports = PriceRanges;
