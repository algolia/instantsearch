import React, { Component } from 'react';
import connect from 'algoliasearch-helper-provider/src/connect';

export default function createSearchBox(Composed) {
  class SearchBoxWrapper extends Component {
    constructor(props) {
      super();

      this.setQuery = props.helper.setQuery.bind(props.helper);
      this.search = props.helper.search.bind(props.helper);
    }
    render() {
      return (
        <Composed
          setQuery={this.setQuery}
          search={this.search}
          {...this.props}
        />
      );
    }
  }

  return connect((state, props) => ({
    query: state.searchParameters.query,
  }))(SearchBoxWrapper);
}
