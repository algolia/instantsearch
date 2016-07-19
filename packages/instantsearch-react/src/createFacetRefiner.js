import React, {PropTypes, Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

import config from '../src/config';

function getKey(operator = 'or') {
  return operator === 'and' ? 'facets' : 'disjunctiveFacets';
}

export default function createFacetRefiner(Composed) {
  class FacetRefiner extends Component {
    static propTypes = {
      helper: PropTypes.object.isRequired,
      attributeName: PropTypes.string.isRequired,
      facetValues: PropTypes.array,
      operator: PropTypes.oneOf(['or', 'and']),
    };

    refine = values => {
      const {attributeName, facetValues, operator} = this.props;

      let state = this.props.helper.getState();
      const key = getKey(this.props.operator);

      if (state[key].indexOf(this.props.attributeName) === -1) {
        // While the facet will already be present in the search results thanks
        // to the configManager, refining it should persist it in the helper's
        // state.
        this.props.helper.setState({
          ...state,
          [key]: state[key].concat([this.props.attributeName]),
        });
        state = this.props.helper.getState();
      }

      facetValues.forEach(val => {
        if (values.indexOf(val.name) !== -1) {
          if (operator === 'and') {
            state = state.addFacetRefinement(attributeName, val.name);
          } else {
            state = state.addDisjunctiveFacetRefinement(attributeName, val.name);
          }
        } else if (operator === 'and') {
          state = state.removeFacetRefinement(attributeName, val.name);
        } else {
          state = state.removeDisjunctiveFacetRefinement(attributeName, val.name);
        }
      });
      this.props.helper.setState(state).search();
    }

    render() {
      return (
        <Composed
          refine={this.refine}
          {...this.props}
        />
      );
    }
  }

  return config(props => ({
    [getKey(props.operator)]: [props.attributeName],
  }))(connect((state, props) => {
    const isFacetPresent =
      state.searchResults &&
      state.searchResults[getKey(props.operator)].some(f =>
        f.name === props.attributeName
      );

    return {
      facetValues: isFacetPresent ?
        state.searchResults.getFacetValues(props.attributeName) :
        null,
    };
  })(FacetRefiner));
}
