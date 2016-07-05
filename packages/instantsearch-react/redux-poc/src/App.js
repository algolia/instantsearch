import React, { Component } from 'react';

import InstantSearch from './lib/InstantSearch';
import Hits from './lib/Hits';
import SearchBox from './lib/SearchBox';

class App extends Component {
  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="movies"
      >
        <SearchBox />
        <Hits />
      </InstantSearch>
    );
  }
}

export default App;
