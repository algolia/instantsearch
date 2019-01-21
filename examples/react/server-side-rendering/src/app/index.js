import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createInstantSearch } from 'react-instantsearch-dom/server';
import {
  RefinementList,
  SearchBox,
  Hits,
  Configure,
} from 'react-instantsearch-dom';

const { InstantSearch, findResultsState } = createInstantSearch();

class App extends Component {
  render() {
    const { resultsState } = this.props;

    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="instant_search"
        resultsState={resultsState}
      >
        <Configure hitsPerPage={3} />
        <SearchBox />
        <Hits />
        <RefinementList attribute="categories" />
      </InstantSearch>
    );
  }
}

App.propTypes = {
  resultsState: PropTypes.object,
};

export { App, findResultsState };
