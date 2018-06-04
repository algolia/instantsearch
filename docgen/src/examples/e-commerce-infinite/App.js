/* eslint react/prop-types: 0 */

import React from 'react';
import {
  InstantSearch,
  HierarchicalMenu,
  RefinementList,
  SortBy,
  Stats,
  ClearRefinements,
  RatingMenu,
  RangeInput,
  Highlight,
  Panel,
  Configure,
  connectSearchBox,
  connectRefinementList,
  connectInfiniteHits,
  connectStateResults,
} from 'react-instantsearch-dom';
import 'instantsearch.css/themes/algolia.css';

export default function App() {
  return (
    <InstantSearch
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="ikea"
    >
      <Configure hitsPerPage={16} />
      <Header />
      <div className="content-wrapper">
        <Facets />
        <CustomResults />
      </div>
    </InstantSearch>
  );
}

const Header = () => (
  <header className="content-wrapper">
    <a
      href="https://community.algolia.com/react-instantsearch/"
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
        attributes={['category', 'sub_category', 'sub_sub_category']}
      />
    </section>

    <section className="facet-wrapper">
      <div className="facet-category-title facet">Refine By</div>

      <Panel header={<h5>Type</h5>}>
        <RefinementList attribute="type" operator="or" limit={5} searchable />
      </Panel>

      <Panel header={<h5>Materials</h5>}>
        <RefinementList
          attribute="materials"
          operator="or"
          limit={5}
          searchable
        />
      </Panel>

      <Panel header={<h5>Colors</h5>}>
        <ConnectedColorRefinementList attribute="colors" operator="or" />
      </Panel>

      <Panel header={<h5>Rating</h5>}>
        <RatingMenu attribute="rating" max={5} />
      </Panel>

      <Panel header={<h5>Price</h5>}>
        <RangeInput attribute="price" />
      </Panel>
    </section>

    <div className="thank-you">
      Data courtesy of <a href="http://www.ikea.com/">ikea.com</a>
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

const ColorItem = ({ item, createURL, refine }) => {
  const active = item.isRefined ? 'checked' : '';
  return (
    <a
      className={`${active} facet-color`}
      href={createURL(item.value)}
      onClick={e => {
        e.preventDefault();
        refine(item.value);
      }}
      data-facet-value={item.label}
    />
  );
};

const CustomColorRefinementList = ({ items, refine, createURL }) =>
  items.map(item => (
    <ColorItem
      key={item.label}
      item={item}
      refine={refine}
      createURL={createURL}
    />
  ));

function CustomHits({ hits, refine, hasMore }) {
  return (
    <main id="hits">
      {hits.map(hit => <Hit item={hit} key={hit.objectID} />)}
      <button
        className="btn btn-primary btn-block btn-load-more"
        onClick={refine}
        disabled={!hasMore}
      >
        Load more
      </button>
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
                { value: 'ikea', label: 'Featured' },
                { value: 'ikea_price_asc', label: 'Price asc.' },
                { value: 'ikea_price_desc', label: 'Price desc.' },
              ]}
              defaultRefinement="ikea"
            />
          </div>
          <Stats />
        </section>
        <ConnectedHits />
      </div>
    );
  }
});

const ConnectedSearchBox = connectSearchBox(CustomSearchBox);
const ConnectedColorRefinementList = connectRefinementList(
  CustomColorRefinementList
);
const ConnectedHits = connectInfiniteHits(CustomHits);
