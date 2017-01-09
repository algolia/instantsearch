import React, {Component} from 'react';
import {InstantSearch, Hits, SearchBox} from 'react-instantsearch/dom';
import {connectSearchBox} from 'react-instantsearch/connectors';
import 'react-instantsearch-theme-algolia/style.css';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {searchState: {}};
  }

  onSearchStateChange(searchState) {
    this.setState({searchState});
  }

  render() {
    return (
      <div>
        {/* You can also nest `<InstantSearch>` components,
         as long as you pass the right state and onStateChange function
         */}
        <FirstResults onSearchStateChange={this.onSearchStateChange.bind(this)}/>
        <SecondResults searchState={this.state.searchState}/>
      </div>
    );
  }
}

const FirstResults = props =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="bestbuy"
    onSearchStateChange={props.onSearchStateChange}
  >
    <SearchBox/>
    <p>Results in first dataset</p>
    <Hits />
  </InstantSearch>;

FirstResults.propTypes = {
  onSearchStateChange: React.PropTypes.func.isRequired,
};

/*
 To perform the same query as the FirstResults instance we need a virtual SearchBox widget
 to handle the search.
 */
const VirtualSearchBox = connectSearchBox(() => null);
const SecondResults = props =>
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
    searchState={props.searchState}
  >
    <VirtualSearchBox/>
    <p>Results in second dataset</p>
    <Hits/>
  </InstantSearch>;

SecondResults.propTypes = {
  searchState: React.PropTypes.object.isRequired,
};

export default App;
