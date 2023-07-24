import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import qs from 'qs';
import React, { Component } from 'react';
import isEqual from 'react-fast-compare';
import {
  InstantSearch,
  HierarchicalMenu,
  Hits,
  Menu,
  Pagination,
  PoweredBy,
  RatingMenu,
  RefinementList,
  SearchBox,
  ClearRefinements,
} from 'react-instantsearch-dom';
import { withRouter } from 'react-router';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const THRESHOLD = 700;
const createURL = (state) => `?${qs.stringify(state)}`;

class App extends Component {
  state = {
    searchState: qs.parse(this.props.router.location.query),
  };

  static getDerivedStateFromProps(props, state) {
    const newSearchState = qs.parse(props.router.location.query);

    if (!isEqual(newSearchState, state.searchState)) {
      return {
        searchState: newSearchState,
      };
    }

    return null;
  }

  onSearchStateChange = (nextSearchState) => {
    const newPush = Date.now();

    this.setState({ lastPush: newPush, searchState: nextSearchState }, () => {
      if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
        this.props.router.replace(
          nextSearchState ? `?${qs.stringify(nextSearchState)}` : ''
        );
      } else {
        this.props.router.push(
          nextSearchState ? `?${qs.stringify(nextSearchState)}` : ''
        );
      }
    });
  };

  render() {
    return (
      <InstantSearch
        searchClient={searchClient}
        indexName="instant_search"
        searchState={this.state.searchState}
        onSearchStateChange={this.onSearchStateChange}
        createURL={createURL}
      >
        <div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 10,
            }}
          >
            <SearchBox />
            <PoweredBy />
          </div>

          <div style={{ display: 'flex' }}>
            <div style={{ padding: '0px 20px' }}>
              <p>Hierarchical Menu</p>
              <HierarchicalMenu
                id="categories"
                attributes={[
                  'hierarchicalCategories.lvl0',
                  'hierarchicalCategories.lvl1',
                  'hierarchicalCategories.lvl2',
                ]}
              />
              <p>Menu</p>
              <Menu attribute="type" />
              <p>Refinement List</p>
              <RefinementList attribute="brand" />
              <p>Range Ratings</p>
              <RatingMenu attribute="rating" max={6} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-around' }}>
                <ClearRefinements />
              </div>
              <div>
                <Hits />
              </div>
              <div style={{ alignSelf: 'center' }}>
                <Pagination showLast={true} />
              </div>
            </div>
          </div>
        </div>
      </InstantSearch>
    );
  }
}

App.propTypes = {
  router: PropTypes.object.isRequired,
};

export default withRouter(App);
