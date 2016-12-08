/* eslint react/prop-types: 0 */
import React from 'react';
import {createConnector} from 'react-instantsearch';
import {
  InstantSearch,
  Hits,
  HierarchicalMenu,
  RefinementList,
  SearchBox,
  SortBy,
  Stats,
  Pagination,
  ClearAll,
  StarRating,
  RangeInput,
  Highlight,
} from 'react-instantsearch/dom';
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
  <header className="content-wrapper header">
    <a href="https://community.algolia.com/instantsearch.js/" className="is-logo"><img
      src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
      width={40}/></a>
    <SearchBox/>
  </header>;

const Facets = () =>
    <aside>

      <ClearAll
        translations={{
          reset: 'Clear all filters',
        }}
      />

      <SideBarSection title="Categories">
        <HierarchicalMenu
          key="categories"
          attributes={[
            'category',
            'sub_category',
            'sub_sub_category',
          ]}
        />
      </SideBarSection>

      <SideBarSection title="Materials">
        <RefinementList attributeName="materials" operator="or" limitMin={10}/>
      </SideBarSection>

      <SideBarSection title="Rating">
        <StarRating attributeName="rating" max={5}/>
      </SideBarSection>

      <SideBarSection title="Price">
        <RangeInput key="price_input" attributeName="price"/>
      </SideBarSection>

      <div className="thank-you">Data courtesy of <a href="http://www.ikea.com/">ikea.com</a></div>
    </aside>
  ;

const SideBarSection = ({title, children}) =>
  <section className="facet-wrapper">
    <div className="facet-category-title facet">{title}</div>
    {children}
  </section>;

const Hit = ({hit}) => {
  const icons = [];
  for (let i = 0; i < 5; i++) {
    const suffix = i >= hit.rating ? '_empty' : '';
    icons.push(<label key={i} label className={`ais-StarRating__ratingIcon${suffix}`}></label>);
  }
  return (
    <article className="hit">
      <div className="product-desc-wrapper">
        <div className="product-name"><Highlight attributeName="name" hit={hit} /></div>
        <div className="product-type"><Highlight attributeName="type" hit={hit} /></div>
        <div className="ais-StarRating__ratingLink">
          {icons}
          <div className="product-price">${hit.price}</div>
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
        <Hits itemComponent={Hit}/>
        <footer><Pagination showLast={true}/></footer>
      </div>
    );
  }
});

export default withUrlSync(App);
