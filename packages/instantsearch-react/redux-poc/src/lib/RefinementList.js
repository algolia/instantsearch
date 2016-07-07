import React, { Component } from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

class RefinementList extends Component {
  componentWillMount() {
    this.addFacet(this.props.helper, this.props.attributeName);
  }

  addFacet(helper, facetName) {
    const state = helper.getState();
    const facetPresent = state.facets.indexOf(facetName) !== -1;
    if (!facetPresent) {
      helper.setState({
        ...state,
        facets: state.facets.concat([facetName]),
      });
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.attributeName !== this.props.attributeName) {
      this.addFacet(nextProps.helper, nextProps.attributeName);
    }
  }

  componentWillUnmount() {
    // @TODO: remove facet if nothing else uses it
  }

  onFacetClick = value => {
    this.props.helper.toggleRefinement(this.props.attributeName, value);
    this.props.helper.search();
  }

  render() {
    const { facets, attributeName, results } = this.props;
    if (!results || facets.indexOf(attributeName) === -1) {
      return <div />
    }
    return (
      <ul>
        {results.getFacetValues(attributeName).map(v =>
          <li
            key={v.name}
            onClick={this.onFacetClick.bind(null, v.name)}
            style={{
              fontWeight: v.isRefined ? 'bold' : null
            }}
          >
            {v.name} {v.count}
          </li>
        )}
      </ul>
    );
  }
}

export default connect(state => ({
  facets: state.searchParameters.facets,
  results: state.searchResults,
}))(RefinementList);
