import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import {
  InstantSearch,
  Hits,
  HierarchicalMenu,
  RefinementList,
  SearchBox,
  SortBy,
  Stats,
  Pagination,
  Panel,
  ClearRefinements,
  RatingMenu,
  RangeInput,
  Highlight,
  Configure,
  connectStateResults,
} from 'react-instantsearch-dom';

import withURLSync from './URLSync';
import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const App = (props) => (
  <InstantSearch
    searchClient={searchClient}
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
  <header className="content-wrapper header">
    <a
      href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/"
      className="is-logo"
    >
      <img
        alt="React InstantSearch"
        className="logo"
        src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
        width={40}
        height={40}
      />
    </a>
    <SearchBox />
  </header>
);

const Facets = () => (
  <aside>
    <ClearRefinements
      translations={{
        reset: 'Clear all filters',
      }}
    />

    <Panel header="Categories">
      <HierarchicalMenu
        attributes={[
          'hierarchicalCategories.lvl0',
          'hierarchicalCategories.lvl1',
          'hierarchicalCategories.lvl2',
        ]}
      />
    </Panel>

    <Panel header="Categories">
      <RefinementList attribute="categories" operator="or" limit={10} />
    </Panel>

    <Panel header="Rating">
      <RatingMenu attribute="rating" max={5} />
    </Panel>

    <Panel header="Price">
      <RangeInput key="price_input" attribute="price" />
    </Panel>

    <div className="thank-you">
      Data courtesy of <a href="https://developer.bestbuy.com/">Best Buy</a>
    </div>
  </aside>
);

const Hit = ({ hit }) => {
  const icons = [];
  for (let i = 0; i < 5; i++) {
    const suffixClassName = i >= hit.rating ? '--empty' : '';
    const suffixXlink = i >= hit.rating ? 'Empty' : '';

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
      <div className="product-desc-wrapper">
        <div className="product-name">
          <Highlight attribute="name" hit={hit} />
        </div>
        <div className="product-type">
          <Highlight attribute="type" hit={hit} />
        </div>
        <div className="product-footer">
          <div className="ais-RatingMenu-link">{icons}</div>
          <div className="product-price">${hit.price}</div>
        </div>
      </div>
    </article>
  );
};

const CustomResults = connectStateResults(({ searchState, searchResults }) => (
  <div className="results-wrapper">
    <section className="results-topbar">
      <Stats />
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
    </section>

    {searchResults && searchResults.nbHits ? (
      <div>
        <Hits hitComponent={Hit} />
        <footer>
          <Pagination showLast={true} />
        </footer>
      </div>
    ) : (
      <div className="no-results">
        No results found matching &quot;
        <span className="query">{searchState.query}</span>
        &quot;
      </div>
    )}
  </div>
));

export default withURLSync(App);
