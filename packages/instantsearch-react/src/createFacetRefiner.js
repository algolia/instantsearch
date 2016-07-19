import React, {PropTypes, Component} from 'react';
import {connect} from 'react-algoliasearch-helper';

import config from '../src/config';

function getKey(operator = 'or') {
  return operator === 'and' ? 'facets' : 'disjunctiveFacets';
}

export default function createFacetRefiner(Composed) {
  class FacetRefiner extends Component {
    static propTypes = {
      // From `connect`
      helper: PropTypes.object.isRequired,
      facetValues: PropTypes.array,

      attributeName: PropTypes.string.isRequired,
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
      const {facetValues, ...otherProps} = this.props;
      return (
        <Composed
          refine={this.refine}
          items={facetValues &&
            facetValues.map(v => ({
              value: v.name,
              count: v.count,
            }))
          }
          selectedItems={facetValues &&
            facetValues.filter(v => v.isRefined).map(v => v.name)
          }
          {...otherProps}
        />
      );
    }
  }

  return config(props => ({
    [getKey(props.operator)]: [props.attributeName],
  }))(connect((state, props) => {
    let isFacetPresent = false;
    if (state.searchResults) {
      // @TODO: Use state.searchResultsSearchParameters instead of _state
      // See https://github.com/algolia/react-algoliasearch-helper/pull/7
      const wasRequested =
        state.searchResults._state[getKey(props.operator)]
          .indexOf(props.attributeName) !== -1;
      const wasReceived =
        Boolean(state.searchResults.getFacetByName(props.attributeName));
      if (wasRequested && !wasReceived) {
        // eslint-disable-next-line no-console
        console.warn(
          `A component requested values for facet "${props.attributeName}", ` +
          'but no facet values were retrieved from the API. This means that ' +
          `you should add the attribute "${props.attributeName}" to the list ` +
          'of attributes for faceting in your index settings.'
        );
      }
      isFacetPresent = wasReceived;
    }
    return {
      facetValues: isFacetPresent ?
        state.searchResults.getFacetValues(props.attributeName) :
        null,
    };
  })(FacetRefiner));
}
