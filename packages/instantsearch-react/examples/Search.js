import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {SearchParameters} from 'algoliasearch-helper';

import InstantSearch from '../src/InstantSearch';
import {
  SearchBox,
  Hits,
  HitsPerPage,
  Pagination,
  RefinementList,
  HierarchicalMenu,
} from '../src/impl';

import history from './history';

// import Hits from '../src/impl/Hits';
// import Pagination from '../src/impl/Pagination';
// import HitsPerPage from '../src/impl/HitsPerPage';
// import RefinementList from '../src/impl/RefinementList';
// import Menu from '../src/impl/Menu';
// import MenuSelect from '../src/impl/MenuSelect';

class Movie extends Component {
  render() {
    return (
      <div>
        <img
          src={this.props.hit.image}
        />
        {this.props.hit.name}
      </div>
    );
  }
}

class Search extends Component {
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

  createURL = (state, getQuery) => history.createHref(
    `${state.page + 1}?${getQuery(state.setPage(undefined))}`
  );

  configureState = state => state.setPage(
    parseInt(this.props.params.page - 1, 10)
  );

  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="instant_search"
        history={history}
        createURL={this.createURL}
        configureState={this.configureState}
      >
        <div>
          <button onClick={this.onSwitchClick}>Switch facet</button>

          <SearchBox focusShortcuts={['s']} searchAsYouType={true} />
          <HitsPerPage
            defaultValue={5}
            values={[5, 10]}
          />
          <HierarchicalMenu
            name="wat"
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
          <RefinementList
            attributeName="brand"
            sortBy={['count']}
          />
          <Hits
            itemComponent={Movie}
            // hitsPerPage={5}
          />
          <Pagination showLast maxPages={10} translations={{next: 'Next'}} />
        </div>
      </InstantSearch>
    );
  }
}

export default withRouter(Search);
