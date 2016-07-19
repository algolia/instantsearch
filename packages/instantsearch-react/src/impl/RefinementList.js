import React, {PropTypes, Component} from 'react';

import createFacetRefiner from '../createFacetRefiner';

class RefinementList extends Component {
  static propTypes = {
    facetValues: PropTypes.array,
    refine: PropTypes.func.isRequired,
  };

  onValueClick = value => {
    const {facetValues} = this.props;
    const nextValues = facetValues.filter(v => v.isRefined).map(v => v.name);
    const idx = nextValues.indexOf(value);
    if (idx === -1) {
      nextValues.push(value);
    } else {
      nextValues.splice(idx, 1);
    }
    this.props.refine(nextValues);
  }

  render() {
    const {facetValues} = this.props;
    if (!facetValues) {
      return null;
    }

    return (
      <ul>
        {facetValues.map(v =>
          <li
            key={v.name}
            onClick={this.onValueClick.bind(null, v.name)}
            style={{
              fontWeight: v.isRefined ? 'bold' : null,
            }}
          >
            {v.name} {v.count}
          </li>
        )}
      </ul>
    );
  }
}

export default createFacetRefiner(RefinementList);
