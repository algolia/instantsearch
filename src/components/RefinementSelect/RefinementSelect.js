import React, {Component, PropTypes} from 'react';

class RefinementSelect extends Component {

  static propTypes = {
    cssClasses: PropTypes.shape({
      select: PropTypes.string,
      option: PropTypes.string,
    }),
    facetValues: PropTypes.array.isRequired,
    toggleRefinement: PropTypes.func.isRequired,
    clearRefinements: PropTypes.func.isRequired,
    attributeNameKey: PropTypes.string,
    limit: PropTypes.number.isRequired,
  }

  static defaultProps = {
    cssClasses: {},
    attributeNameKey: 'name',
  }

  get selectValue(): {name: string} {
    const selectValue = this.facetValues.find(({isRefined}) => isRefined);
    return selectValue || {name: 'all'};
  }

  get totalCount(): number {
    const {facetValues} = this.props;
    return facetValues.reduce((total, {count}) => total + count, 0);
  }

  get facetValues(): number {
    const {facetValues, limit} = this.props;
    return facetValues.slice(0, limit);
  }

  handleSelectChange = ({target: {value}}) => {
    // we want clear all refinements when the user select `See all` option
    if (value === 'all') {
      this.props.clearRefinements();
      return;
    }

    const {toggleRefinement, attributeNameKey} = this.props;
    const {[attributeNameKey]: facetValueToRefine, isRefined} = this.facetValues.find(({name}) => name === value);

    toggleRefinement(facetValueToRefine, isRefined);
  }

  render() {
    const {cssClasses} = this.props;

    return (
      <select
        className={ cssClasses.select }
        value={ this.selectValue.name }
        onChange={ this.handleSelectChange }
      >
        <option
          value="all"
          className={ cssClasses.option }
        >
          See all ({ this.totalCount })
        </option>

        { this.facetValues.map(({name, path, count}) =>
          <option
            key={ name }
            value={ path }
            className={ cssClasses.option }
          >
            { name } ({ count })
          </option>
        ) }
      </select>
    );
  }

}

export default RefinementSelect;
