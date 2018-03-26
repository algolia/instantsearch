import PropTypes from 'prop-types';
import React, { Component } from 'react';
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
} from 'react-instantsearch/dom';
import { withRouter } from 'react-router';
import qs from 'qs';
import { isEqual } from 'lodash';

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { searchState: { ...qs.parse(props.router.location.query) } };
    this.onSearchStateChange = this.onSearchStateChange.bind(this);
    this.createURL = this.createURL.bind(this);
  }

  componentWillReceiveProps() {
    this.setState({ searchState: qs.parse(this.props.router.location.query) });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return !isEqual(this.state.searchState, nextState.searchState);
  }

  onSearchStateChange(nextSearchState) {
    const THRESHOLD = 700;
    const newPush = Date.now();
    this.setState({ lastPush: newPush, searchState: nextSearchState });
    if (this.state.lastPush && newPush - this.state.lastPush <= THRESHOLD) {
      this.props.router.replace(
        nextSearchState ? `?${qs.stringify(nextSearchState)}` : ''
      );
    } else {
      this.props.router.push(
        nextSearchState ? `?${qs.stringify(nextSearchState)}` : ''
      );
    }
  }

  createURL(state) {
    return `?${qs.stringify(state)}`;
  }

  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="ikea"
        searchState={this.state.searchState}
        onSearchStateChange={this.onSearchStateChange}
        createURL={this.createURL}
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
                attributes={['category', 'sub_category', 'sub_sub_category']}
              />
              <p>Menu</p>
              <Menu attribute="type" />
              <p>Refinement List</p>
              <RefinementList attribute="colors" />
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
