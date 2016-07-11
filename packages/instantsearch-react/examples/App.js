import React, {Component} from 'react';

import InstantSearch from '../src/InstantSearch';
import SearchBox from '../src/impl/SearchBox';
import Hits from '../src/impl/Hits';
import Pagination from '../src/impl/Pagination';

import RefinementList from './RefinementList';

class Movie extends Component {
  render() {
    return (
      <div>
        <img src={this.props.hit.image} />
        {this.props.hit.title}
      </div>
    );
  }
}

class App extends Component {
  constructor() {
    super();

    this.state = {
      facet: 'genre',
    };
  }

  onSwitchClick = () => {
    this.setState(state => ({
      facet: state.facet === 'genre' ? 'year' : 'genre',
    }));
  };

  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="movies"
      >
        <div>
          <button onClick={this.onSwitchClick}>Switch facet</button>
          <RefinementList attributeName={this.state.facet} />
          <SearchBox />
          <Pagination />
          <Hits
            itemComponent={Movie}
            hitsPerPage={5}
          />
        </div>
      </InstantSearch>
    );
  }
}

export default App;
