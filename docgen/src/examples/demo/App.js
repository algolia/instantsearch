/* eslint react/prop-types: 0 */

import React from 'react';
import {createConnector} from 'react-instantsearch';
import {
  InstantSearch,
  SearchBox,
  RefinementList,
  SortBy,
  Stats,
  Pagination,
  Highlight,
  Menu,
  ClearAll,
} from 'react-instantsearch/dom';
import {
  connectRange,
  connectHits,
} from 'react-instantsearch/connectors';
import {withUrlSync} from '../urlSync';
import 'react-instantsearch-theme-algolia/style.scss';
import Slider from 'rc-slider';

const App = props =>
  <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="instant_search"
    searchState={props.searchState}
    createURL={props.createURL.bind(this)}
    onSearchStateChange={props.onSearchStateChange.bind(this)}
    searchParameters={{hitsPerPage: 10}}
  >
      <header id="header">
        <img src="examples/demo/instant_search_logo@2x.png"/>
        <SearchBox translations={{placeholder: 'Search for products'}}/>
      </header>
      <main>
        <Content/>
      </main>
      <footer>
        Source Code on <a
        href="https://github.com/algolia/instantsearch.js/tree/v2/docgen/src/examples/demo">Github</a> -
        Powered by <a href="https://www.algolia.com">Algolia</a> - Data from <a href="https://developer.bestbuy.com">Best
        Buy</a>
      </footer>
  </InstantSearch>;

const RightColumn = () =>
    <div id="right-column">
      <div className="info">
        <Stats/>
        <SortBy
          items={[
            {value: 'instant_search', label: 'Most Relevant'},
            {value: 'instant_search_price_asc', label: 'Lowest Price'},
            {value: 'instant_search_price_desc', label: 'Highest Price'},
          ]}
          defaultRefinement="instant_search"/>
      </div>
      <ConnectedHits/>
      <div id="pagination">
        <Pagination showLast/>
      </div>
  </div>;

const Content = createConnector({
  displayName: 'ConditionalResults',
  getProvidedProps(props, searchState, searchResults) {
    const noResults = searchResults.results ? searchResults.results.nbHits === 0 : false;
    return {query: searchState.query, noResults};
  },
})(({noResults, query}) => {
  const rightColumn = noResults
    ? <div id="no-results-message">
        <p>We didn't find any results for the search <em>{query}</em>.</p>
        <ClearAll/>
      </div>
    : <RightColumn/>;
  return <div>
    <div id="left-column" className={noResults ? 'no-results' : ''}>
      <h5>Category</h5>
      <RefinementList attributeName="categories"/>
      <h5>Brand</h5>
      <RefinementList attributeName="brand"/>
      <h5>Price</h5>
      <ConnectedRange attributeName="price"/>
      <h5>Type</h5>
      <Menu attributeName="type"/>
    </div>
    {rightColumn}
  </div>;
});

const Range = React.createClass({
  getInitialState() {
    return {currentValues: {min: this.props.min, max: this.props.max}};
  },
  componentWillReceiveProps(sliderState) {
    this.setState({currentValues: {min: sliderState.currentRefinement.min, max: sliderState.currentRefinement.max}});
  },

  onValuesUpdated(values) {
    this.setState({currentValues: {min: values[0], max: values[1]}});
  },

  onChange(values) {
    if (this.props.currentRefinement.min !== values[0] || this.props.currentRefinement.max !== values[1]) {
      this.props.refine({min: values[0], max: values[1]});
    }
  },
  render() {
    const {min, max} = this.props;
    const {currentValues} = this.state;
    return (
      <div className="ais-Slider__root">
        <Slider range value={[currentValues.min, currentValues.max]} min={min} max={max}
                onChange={this.onValuesUpdated} onAfterChange={this.onChange}
        />
        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10}}>
          <div>{min}</div>
          <div>{max}</div>
        </div>
      </div>
    );
  },
});

Range.propTypes = {
  min: React.PropTypes.number.isRequired,
  max: React.PropTypes.number.isRequired,
  currentRefinement: React.PropTypes.object.isRequired,
  refine: React.PropTypes.func.isRequired,
};

const ConnectedRange = connectRange(Range);

function CustomHits({hits}) {
  return (
    <main id="hits">
      {hits.map((hit, idx) =>
        <Hit item={hit} key={idx}/>
      )}
    </main>
  );
}

const Hit = ({item}) =>
  <div className="hit">
    <div className="hit-image">
      <img src={`${item.image}`} alt={item.name}/>
    </div>
    <div className="hit-content">
      <div className="hit-price">${item.price}</div>
      <div className="hit-name"><Highlight attributeName="name" hit={item}/></div>
      <div className="hit-description"><Highlight attributeName="description" hit={item}/></div>
    </div>
  </div>;

const ConnectedHits = connectHits(CustomHits);

export default withUrlSync(App);
