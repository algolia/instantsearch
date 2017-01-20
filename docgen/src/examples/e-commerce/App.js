/* eslint react/prop-types: 0 */

import React from 'react';
import {createConnector} from 'react-instantsearch';
import {
  InstantSearch,
  HierarchicalMenu,
  RefinementList,
  SortBy,
  Stats,
  Pagination,
  ClearAll,
  StarRating,
  RangeInput,
  Highlight,
  Panel,
} from 'react-instantsearch/dom';
import {
  connectSearchBox,
  connectRefinementList,
  connectHits,
} from 'react-instantsearch/connectors';
import {withUrlSync} from '../urlSync';
import 'react-instantsearch-theme-algolia/style.scss';

const App = props =>
  <InstantSearch
    className="container-fluid"
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="ikea"
    searchState={props.searchState}
    createURL={props.createURL.bind(this)}
    onSearchStateChange={props.onSearchStateChange.bind(this)}
    searchParameters={{hitsPerPage: 16}}
  >
    <Header />
    <div className="content-wrapper">
      <Facets />
      <CustomResults />
    </div>
  </InstantSearch>;

const Header = () =>
  <header className="content-wrapper">
    <a href="https://community.algolia.com/instantsearch.js/" className="is-logo"><img
      src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
      width={40}/></a>
    <a href="./" className="logo">amazing</a>
    <ConnectedSearchBox/>
  </header>;

const Facets = () =>
    <aside>

      <ClearAll
        translations={{
          reset: 'Clear all filters',
        }}
      />

      <section className="facet-wrapper">
        <div className="facet-category-title facet">Show results for</div>
          <HierarchicalMenu
            key="categories"
            attributes={[
              'category',
              'sub_category',
              'sub_sub_category',
            ]}
          />
      </section>

      <section className="facet-wrapper">
        <div className="facet-category-title facet">RefineBy</div>
          <Panel title="Type">
            <RefinementList attributeName="type" operator="or" limitMin={5} searchForFacetValues/>
          </Panel>
          <Panel
            title="Materials">
            <RefinementList attributeName="materials" operator="or" limitMin={5} searchForFacetValues/>
          </Panel>
          <ConnectedColorRefinementList attributeName="colors" operator="or"/>
          <Panel title="Rating">
          <StarRating attributeName="rating" max={5}/>
          </Panel>
          <Panel title="Price">
            <RangeInput key="price_input" attributeName="price" />
          </Panel>
      </section>
      <div className="thank-you">Data courtesy of <a href="http://www.ikea.com/">ikea.com</a></div>
    </aside>;

const CustomSearchBox = ({currentRefinement, refine}) =>
    <div className="input-group">
      <input type="text"
             value={currentRefinement}
             onChange={e => refine(e.target.value)}
             autoComplete="off"
             className="form-control"
             id="q"/>
      <span className="input-group-btn">
      <button className="btn btn-default"><i className="fa fa-search"></i></button>
    </span>
    </div>
  ;

const ColorItem = ({item, createURL, refine}) => {
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
    >
    </a>
  );
};

const CustomColorRefinementList = ({items, refine, createURL}) =>
    items.length > 0 ? <div>
      <h5 className={'ais-Panel__Title'}>Colors</h5>
      {items.map(item =>
        <ColorItem
          key={item.label}
          item={item}
          refine={refine}
          createURL={createURL}
        />
      )}
    </div> : null;

function CustomHits({hits}) {
  return (
    <main id="hits">
      {hits.map((hit, idx) =>
        <Hit item={hit} key={idx}/>
      )}
    </main>
  );
}

const Hit = ({item}) => {
  const icons = [];
  for (let i = 0; i < 5; i++) {
    const suffix = i >= item.rating ? '_empty' : '';
    icons.push(<label key={i} label className={`ais-StarRating__ratingIcon${suffix}`}></label>);
  }
  return (
    <article className="hit">
      <div className="product-picture-wrapper">
        <div className="product-picture"><img src={`${item.image}`}/></div>
      </div>
      <div className="product-desc-wrapper">
        <div className="product-name"><Highlight attributeName="name" hit={item}/></div>
        <div className="product-type"><Highlight attributeName="type" hit={item}/></div>
        <div className="ais-StarRating__ratingLink">
          {icons}
          <div className="product-price">${item.price}</div>
        </div>
      </div>
    </article>);
};

const CustomResults = createConnector({
  displayName: 'CustomResults',

  getProvidedProps(props, searchState, searchResults) {
    const noResults = searchResults.results ? searchResults.results.nbHits === 0 : false;
    return {query: searchState.query, noResults};
  },
})(({noResults, query}) => {
  if (noResults) {
    return (
      <div className="results-wrapper">
        <div className="no-results">
          No results found matching <span className="query">{query}</span>
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
                {value: 'ikea', label: 'Featured'},
                {value: 'ikea_price_asc', label: 'Price asc.'},
                {value: 'ikea_price_desc', label: 'Price desc.'},
              ]}
              defaultRefinement="ikea"
            />
          </div>
          <Stats />
        </section>
        <ConnectedHits/>
        <footer><Pagination showLast={true}/></footer>
      </div>
    );
  }
});

const ConnectedSearchBox = connectSearchBox(CustomSearchBox);
const ConnectedColorRefinementList = connectRefinementList(CustomColorRefinementList);
const ConnectedHits = connectHits(CustomHits);

export default withUrlSync(App);
