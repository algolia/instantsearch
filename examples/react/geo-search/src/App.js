import algoliasearch from 'algoliasearch/lite';
import qs from 'qs';
import React, { Component, Fragment } from 'react';
import { InstantSearch, SearchBox, Configure } from 'react-instantsearch-dom';
import {
  GoogleMapsLoader,
  GeoSearch,
  Control,
  Marker,
} from 'react-instantsearch-dom-maps';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76',
  {
    _useRequestCache: true,
  }
);

const updateAfter = 700;
const searchStateToUrl = (searchState) =>
  searchState ? `${window.location.pathname}?${qs.stringify(searchState)}` : '';

class App extends Component {
  constructor() {
    super();

    this.state = {
      searchState: qs.parse(window.location.search.slice(1)),
    };

    window.addEventListener('popstate', ({ state: searchState }) => {
      this.setState({ searchState });
    });
  }

  onSearchStateChange = (searchState) => {
    // update the URL when there is a new search state.
    clearTimeout(this.debouncedSetState);
    this.debouncedSetState = setTimeout(() => {
      window.history.pushState(
        searchState,
        null,
        searchStateToUrl(searchState)
      );
    }, updateAfter);

    this.setState((previousState) => {
      const hasQueryChanged =
        previousState.searchState.query !== searchState.query;

      return {
        ...previousState,
        searchState: {
          ...searchState,
          boundingBox: !hasQueryChanged ? searchState.boundingBox : null,
        },
      };
    });
  };

  render() {
    const { searchState } = this.state;

    const parameters = {};
    if (!searchState.boundingBox) {
      parameters.aroundLatLngViaIP = true;
      parameters.aroundRadius = 'all';
    }

    return (
      <InstantSearch
        searchClient={searchClient}
        indexName="airbnb"
        searchState={searchState}
        onSearchStateChange={this.onSearchStateChange}
      >
        <Configure {...parameters} />
        Type a destination or move the map to see the closest apartment.
        <SearchBox />
        <GoogleMapsLoader apiKey="AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ">
          {(google) => (
            <GeoSearch google={google}>
              {({ hits }) => (
                <Fragment>
                  <Control />
                  {hits.map((hit) => (
                    <Marker key={hit.objectID} hit={hit} />
                  ))}
                </Fragment>
              )}
            </GeoSearch>
          )}
        </GoogleMapsLoader>
      </InstantSearch>
    );
  }
}

export default App;
