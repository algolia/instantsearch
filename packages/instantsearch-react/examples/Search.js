import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {omit} from 'lodash';
import qs from 'qs';

import InstantSearch from '../src/InstantSearch';
import {
  Pagination,
  PaginationSelect,
  RefinementList,
  Menu,
  HierarchicalMenu,
  SearchBox,
  Hits,
  HitsPerPage,
  NumericRefinementList,
  Range,
  CurrentFilters,
  Toggle,
  SortByLinks,
  Stats,
  ScrollTo,
  Reset,
  Error,
} from '../';
import history from './history';

class Search extends Component {
  createURL = state => history.createHref(
    `${state.p ? state.p + 1 : 1}?${qs.stringify(omit(state, 'p'))}`
  );

  onStateChange = state => {
    history.push(this.createURL(state));
  };

  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="instant_search"
        history={history}
        threshold={700}
        //createURL={this.createURL}
        //onStateChange={this.onStateChange}
        //state={{
        //  ...this.props.location.query,
        //  p: parseInt(this.props.params.page - 1, 10),
        //}}
      >
        <div>
          <Error />
          <ScrollTo>
            <SearchBox />
          </ScrollTo>
          <Stats />
          <CurrentFilters />
          <Reset />
          <Toggle
            attributeName="free_shipping"
            value={true}
            label="Free shipping"
          />
          <SortByLinks
            items={[
              {
                label: 'Popularity',
                index: 'instant_search',
              },
              {
                label: 'Price (asc)',
                index: 'instant_search_price_asc',
              },
              {
                label: 'Price (desc)',
                index: 'instant_search_price_desc',
              },
            ]}
            defaultSelectedIndex="instant_search"
          />
          <HitsPerPage items={[10, 20, 30]} defaultHitsPerPage={20} />
          <Range
            attributeName="price"
            translations={{
              value: v => `$${v.toLocaleString()}`,
            }}
          />
          <NumericRefinementList
            attributeName="rating"
            items={[
              {
                label: 'All',
              },
              {
                label: 'More than 5',
                start: 5,
              },
              {
                label: 'More than 3',
                start: 3,
              },
              {
                label: 'Between 1 and 4',
                start: 1,
                end: 4,
              },
            ]}
          />
          <RefinementList
            attributeName="categories"
            defaultSelectedItems={['Audio']}
          />
          <Menu
            attributeName="brand"
          />
          <HierarchicalMenu
            name="ok"
            attributes={[
              'hierarchicalCategories.lvl0',
              'hierarchicalCategories.lvl1',
              'hierarchicalCategories.lvl2',
            ]}
          />
          <Hits />
          <PaginationSelect />
          <Pagination />
        </div>
      </InstantSearch>
    );
  }
}

export default withRouter(Search);
