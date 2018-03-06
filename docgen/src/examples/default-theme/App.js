/* eslint react/prop-types: 0 */
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
} from 'react-instantsearch/dom';
import { connectStateResults } from 'react-instantsearch/connectors';
import { withUrlSync } from '../urlSync';
import 'instantsearch.css/themes/algolia.css';

const App = props => (
  <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
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
      href="https://community.algolia.com/react-instantsearch/"
      className="is-logo"
    >
      <img
        className="logo"
        src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
        width={40}
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
        attributes={['category', 'sub_category', 'sub_sub_category']}
      />
    </Panel>

    <Panel header="Materials">
      <RefinementList attribute="materials" operator="or" limit={10} />
    </Panel>

    <Panel header="Rating">
      <RatingMenu attribute="rating" max={5} />
    </Panel>

    <Panel header="Price">
      <RangeInput key="price_input" attribute="price" />
    </Panel>

    <div className="thank-you">
      Data courtesy of <a href="http://www.ikea.com/">ikea.com</a>
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
            { value: 'ikea', label: 'Featured' },
            { value: 'ikea_price_asc', label: 'Price asc.' },
            { value: 'ikea_price_desc', label: 'Price desc.' },
          ]}
          defaultRefinement="ikea"
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
        No results found matching &quot;<span className="query">
          {searchState.query}
        </span>&quot;
      </div>
    )}
  </div>
));

export default withUrlSync(App);
