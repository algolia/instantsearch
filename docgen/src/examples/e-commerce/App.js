/* eslint react/prop-types: 0 */

import React from 'react';
import {
  InstantSearch,
  HierarchicalMenu,
  RefinementList,
  SortBy,
  Stats,
  Pagination,
  ClearRefinements,
  RatingMenu,
  RangeInput,
  Highlight,
  Panel,
  Configure,
  connectSearchBox,
  connectHits,
  connectStateResults,
} from 'react-instantsearch-dom';
import { withUrlSync } from '../urlSync';
import 'instantsearch.css/themes/algolia.css';

const App = props => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="instant_search"
    searchState={props.searchState}
    createURL={props.createURL}
    onSearchStateChange={props.onSearchStateChange}
  >
    <Configure hitsPerPage={16} />
    <Header />
    <div className="content-wrapper">
      <Facets />
      <CustomResults />
    </div>
  </InstantSearch>
);

const Header = () => (
  <header className="content-wrapper">
    <a
      href="https://community.algolia.com/react-instantsearch"
      className="is-logo"
    >
      <img
        src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
        width={40}
      />
    </a>
    <a href="./" className="logo">
      aeki
    </a>
    <ConnectedSearchBox />
  </header>
);

const Facets = () => (
  <aside>
    <ClearRefinements
      translations={{
        reset: 'Clear all filters',
      }}
    />

    <section className="facet-wrapper">
      <div className="facet-category-title facet">Show results for</div>
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
      />
    </section>

    <section className="facet-wrapper">
      <div className="facet-category-title facet">Refine By</div>

      <Panel header={<h5>Type</h5>}>
        <RefinementList attribute="type" operator="or" limit={5} />
      </Panel>

      <Panel header={<h5>Brand</h5>}>
        <RefinementList attribute="brand" operator="or" limit={5} searchable />
      </Panel>

      <Panel header={<h5>Rating</h5>}>
        <RatingMenu attribute="rating" max={5} />
      </Panel>

      <Panel header={<h5>Price</h5>}>
        <RangeInput attribute="price" />
      </Panel>
    </section>

    <div className="thank-you">
      Data courtesy of <a href="https://developer.bestbuy.com/">Best Buy</a>
    </div>
  </aside>
);

const CustomSearchBox = ({ currentRefinement, refine }) => (
  <div className="input-group">
    <input
      type="text"
      value={currentRefinement}
      onChange={e => refine(e.target.value)}
      autoComplete="off"
      className="form-control"
      id="q"
    />
    <span className="input-group-btn">
      <button className="btn btn-default">
        <i className="fa fa-search" />
      </button>
    </span>
  </div>
);

function CustomHits({ hits }) {
  return (
    <main id="hits">
      {hits.map(hit => (
        <Hit item={hit} key={hit.objectID} />
      ))}
    </main>
  );
}

const Hit = ({ item }) => {
  const icons = [];
  for (let i = 0; i < 5; i++) {
    const suffixClassName = i >= item.rating ? '--empty' : '';
    const suffixXlink = i >= item.rating ? 'Empty' : '';

    icons.push(
      <svg
        key={i}
        className={`ais-RatingMenu-starIcon ais-RatingMenu-starIcon${suffixClassName}`}
        aria-hidden="true"
        width="24"
        height="24"
      >
        <use xlinkHref={`#ais-RatingMenu-star${suffixXlink}Symbol`} />
      </svg>
    );
  }
  return (
    <article className="hit">
      <div className="product-picture-wrapper">
        <div className="product-picture">
          <img
            src={`https://res.cloudinary.com/hilnmyskv/image/fetch/h_300,q_100,f_auto/${
              item.image
            }`}
          />
        </div>
      </div>
      <div className="product-desc-wrapper">
        <div className="product-name">
          <Highlight attribute="name" hit={item} />
        </div>
        <div className="product-type">
          <Highlight attribute="type" hit={item} />
        </div>
        <div className="product-footer">
          <div className="ais-RatingMenu-link">{icons}</div>
          <div className="product-price">${item.price}</div>
        </div>
      </div>
    </article>
  );
};

const CustomResults = connectStateResults(({ searchState, searchResult }) => {
  if (searchResult && searchResult.nbHits === 0) {
    return (
      <div className="results-wrapper">
        <div className="no-results">
          No results found matching{' '}
          <span className="query">{searchState.query}</span>
        </div>
      </div>
    );
  } else {
    return (
      <div className="results-wrapper">
        <section id="results-topbar">
          <div className="sort-by">
            <label>Sort by</label>
            <SortBy
              items={[
                { value: 'instant_search', label: 'Featured' },
                { value: 'instant_search_price_asc', label: 'Price asc.' },
                { value: 'instant_search_price_desc', label: 'Price desc.' },
              ]}
              defaultRefinement="instant_search"
            />
          </div>
          <Stats />
        </section>
        <ConnectedHits />
        <footer>
          <Pagination showLast={true} />
        </footer>
      </div>
    );
  }
});

const ConnectedSearchBox = connectSearchBox(CustomSearchBox);
const ConnectedHits = connectHits(CustomHits);

export default withUrlSync(App);
