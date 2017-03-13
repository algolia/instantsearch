import React, {Component, PropTypes} from 'react';

class RefinementSelect extends Component {

  static propTypes = {
    cssClasses: PropTypes.shape({select: PropTypes.string}),
    facetValues: PropTypes.array.isRequired,
    createURL: PropTypes.func.isRequired,
  }

  get selectValue() {
    const {facetValues} = this.props;
    return facetValues.find(({isRefined}) => isRefined);
  }

  handleSelectChange = ({target: {value}}) => {
    console.log(value);
  }

  render() {
    const {facetValues} = this.props;

    return (
      <div>
        <select
          value={ this.selectValue }
          onChange={ this.handleSelectChange }
        >
          { facetValues.map(({name, path, count}) =>
            <option key={ name } value={ path }>
              { name } ({ count })
            </option>
          ) }
        </select>

        <pre>{ JSON.stringify(this.props, null, 4) }</pre>
      </div>
    );
  }

}

export default RefinementSelect;
