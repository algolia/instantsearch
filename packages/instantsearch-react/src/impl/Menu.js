import React, {PropTypes, Component} from 'react';

import createFacetRefiner from '../createFacetRefiner';

class Menu extends Component {
  static propTypes = {
    facetValues: PropTypes.array,
    refine: PropTypes.func.isRequired,
  };

  render() {
    const {facetValues, refine} = this.props;
    if (!facetValues) {
      return null;
    }

    return (
      <ul>
        {facetValues.map(v =>
          <li
            key={v.name}
            onClick={refine.bind(null, [v.name])}
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

export default createFacetRefiner(Menu);
