import React, {Component} from 'react';
import {withRouter} from 'react-router';
import {omit} from 'lodash';
import qs from 'qs';

import InstantSearch from '../src/InstantSearch';
import connectCurrentFilters from '../src/connectors/connectCurrentFilters';
import {
  Pagination,
  RefinementList,
  Menu,
  HierarchicalMenu,
  SearchBox,
  Hits,
  HitsPerPage,
  NumericRefinementList,
  Range,
} from '../';
import history from './history';

const CurrentFilters = connectCurrentFilters(props =>
  <div>
    {props.filters.map(filter =>
      <span key={filter.key}>{filter.label}</span>
    )}
    <button onClick={() => props.refine(props.filters)}>
      Clear all
    </button>
  </div>
);

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
        createURL={this.createURL}
        onStateChange={this.onStateChange}
        state={{
          ...this.props.location.query,
          p: parseInt(this.props.params.page - 1, 10),
        }}
      >
        <div>
          <SearchBox />
          <CurrentFilters />
          <HitsPerPage values={[10, 20, 30]} defaultHitsPerPage={20} />
          <Range attributeName="price" />
          {/*<NumericRefinementList
            attributeName="price"
            items={[
              {
                label: 'All',
              },
              {
                label: 'More than 60',
                start: 60,
              },
            ]}
            defaultSelectedItem="60:"
          />*/}
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
          <Pagination id="p" />
        </div>
      </InstantSearch>
    );
  }
}

export default withRouter(Search);
