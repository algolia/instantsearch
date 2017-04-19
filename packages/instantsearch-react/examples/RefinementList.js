import React, {Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

import config from '../src/config';

function getKey(operator = 'or') {
  return operator === 'and' ? 'facets' : 'disjunctiveFacets';
}

class RefinementList extends Component {
  onFacetClick = value => {
    const state = this.props.helper.getState();
    const key = getKey(this.props.operator);
    if (state[key].indexOf(this.props.attributeName) === -1) {
      // While the facet will already be present in the search results thanks
      // to the configManager, refining it should persist it in the helper's
      // state.
      this.props.helper.setState({
        ...this.props.helper.getState(),
        [key]: state[key].concat([this.props.attributeName]),
      });
    }
    this.props.helper.toggleRefinement(this.props.attributeName, value);
    this.props.helper.search();
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
            onClick={this.onFacetClick.bind(null, v.name)}
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

export default config(props => ({
  [getKey(props.operator)]: [props.attributeName],
}))(connect((state, props) => {
  const isFacetPresent = (
    state.searchResults &&
    state.searchResults[getKey(props.operator)].some(f => f.name === props.attributeName)
  );

  return {
    facetValues: (
      isFacetPresent ?
        state.searchResults.getFacetValues(props.attributeName) :
        null
    ),
  };
})(RefinementList));
