import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  InstantSearch,
  RefinementList,
  SearchBox,
  Hits,
  Configure,
  CurrentRefinements,
} from 'react-instantsearch-dom';

class App extends Component {
  static propTypes = {
    indexName: PropTypes.string.isRequired,
    searchClient: PropTypes.object.isRequired,
    searchState: PropTypes.object,
    resultsState: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.object),
      PropTypes.object,
    ]),
  };

  static defaultProps = {
    searchState: {},
  };

  state = {
    searchState: this.props.searchState,
  };

  onSearchStateChange = (nextSearchState) =>
    this.setState({ searchState: nextSearchState });

  render() {
    const { searchState } = this.state;

    return (
      <InstantSearch
        {...this.props}
        searchState={searchState}
        onSearchStateChange={this.onSearchStateChange}
      >
        <Configure hitsPerPage={3} />
        <SearchBox />
        <CurrentRefinements />
        <RefinementList attribute="brand" />
        <Hits />
      </InstantSearch>
    );
  }
}

export default App;
