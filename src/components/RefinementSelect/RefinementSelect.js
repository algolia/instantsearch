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
    templateProps: PropTypes.shape({
      templates: PropTypes.shape({
        seeAllOption: PropTypes.string,
        selectOption: PropTypes.func,
      }),
    }),
  }

  static defaultProps = {
    cssClasses: {},
    attributeNameKey: 'name',
    templateProps: {},
  }

  get selectValue(): {name: string} {
    const selectValue = this.facetValues.find(({isRefined}) => isRefined);
    return selectValue || {name: 'all'};
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
    const {cssClasses, templateProps: {templates}} = this.props;

    return (
      <select
        className={ cssClasses.select }
        value={ this.selectValue.name }
        onChange={ this.handleSelectChange }
      >
        <option value="all" className={ cssClasses.option }>
          {templates && templates.seeAllOption || 'See all'}
        </option>

        { this.facetValues.map(({name, count}) =>
          <option
            key={ name }
            value={ name }
            className={ cssClasses.option }
          >
            { templates && templates.selectOption
                ? templates.selectOption({name, count})
                : `${name} (${count})`
            }
          </option>
        ) }
      </select>
    );
  }

}

export default RefinementSelect;
