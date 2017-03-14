import React, {Component, PropTypes} from 'react';

class RefinementSelect extends Component {

  static propTypes = {
    cssClasses: PropTypes.shape({select: PropTypes.string}),
    facetValues: PropTypes.array.isRequired,
    toggleRefinement: PropTypes.func.isRequired,
    clearRefinements: PropTypes.func.isRequired,
    attributeNameKey: PropTypes.string,
  }

  static defaultProps = {
    cssClasses: {},
    attributeNameKey: 'name',
  }

  get selectValue(): {name: string} {
    const {facetValues} = this.props;
    const selectValue = facetValues.find(({isRefined}) => isRefined);

    return selectValue || {name: 'all'};
  }

  get totalCount(): number {
    const {facetValues} = this.props;
    return facetValues.reduce((total, {count}) => total + count, 0);
  }

  handleSelectChange = ({target: {value}}) => {
    // we want clear all refinements when the user select `See all` option
    if (value === 'all') {
      this.props.clearRefinements();
      return;
    }

    const {facetValues, toggleRefinement, attributeNameKey} = this.props;
    const {[attributeNameKey]: facetValueToRefine, isRefined} = facetValues.find(({name}) => name === value);

    toggleRefinement(facetValueToRefine, isRefined);
  }

  render() {
    const {facetValues} = this.props;

    return (
      <select
        value={ this.selectValue.name }
        onChange={ this.handleSelectChange }
      >
        {/* TODO: use templating for "see all" option, ask @vvo */}
        <option value="all">See all ({ this.totalCount })</option>

        { facetValues.map(({name, path, count}) =>
          <option key={ name } value={ path }>
            { name } ({ count })
          </option>
        ) }
      </select>
    );
  }

}

export default RefinementSelect;
