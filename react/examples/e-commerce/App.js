/* eslint react/prop-types: 0 */

import React from 'react';
import {
  InstantSearch,
  SearchBox,
  HierarchicalMenu,
  RefinementList,
  Hits,
  SortBy,
  Stats,
  Pagination,
  CurrentFilters,
  MultiRange,
  Range,
  createConnector,
} from 'react-instantsearch';

export default function App() {
  return (
    <InstantSearch
      className="container-fluid"
      appId="latency"
      apiKey="6be0576ff61c053d5f9a3225e2a90f76"
      indexName="ikea"
    >
      <div>
        <Header />
        <div className="content-wrapper">
          <Facets />
          <CustomResults />
        </div>
      </div>
    </InstantSearch>
  );
}

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

      <CurrentFilters
        theme={{
          root: 'CurrentFilters',
          filters: {
            display: 'none',
          },
          clearAll: 'CurrentFilters__clearAll btn',
        }}
        translations={{
          clearAll: 'Clear all filters',
        }}
      />

      <SideBarSection
        title="Show results for"
        items={[
          <HierarchicalMenu
            id="categories"
            key="categories"
            attributes={[
              'category',
              'sub_category',
              'sub_sub_category',
            ]}
          />,
        ]}
      />

      <SideBarSection
        title="Refine by"
        items={[
          <RefinementListWithTitle
            title="Materials"
            key="Materials"
            item={<RefinementList attributeName="materials" operator="or" limitMin={10}/>}
          />,
          <RefinementListWithTitle
            title="Color"
            key="Color"
            item={<ConnectedColorRefinementList attributeName="colors" operator="or"/>}
          />,
          <RefinementListWithTitle
            title="Rating"
            key="rating"
            item={<Range.Rating attributeName="rating" max={5}/>}
          />,
          <RefinementListWithTitle
            title="Price"
            key="Price"
            item={ <CustomPriceRanges
              attributeName="price"
              id="price_ranges"
              items={[
                {end: 10},
                {start: 10, end: 20},
                {start: 20, end: 50},
                {start: 50, end: 100},
                {start: 100, end: 300},
                {start: 300, end: 500},
                {start: 500},
              ]}
            />}
          />,
          <Range.Input key="price_input" attributeName="price" id="price_input"/>,
        ]}
      />
      <div className="thank-you">Data courtesy of <a href="http://www.ikea.com/">ikea.com</a></div>
    </aside>
  ;

const SideBarSection = ({title, items}) =>
  <section className="facet-wrapper">
    <div className="facet-category-title facet">{title}</div>
    {items.map(i => i)}
  </section>;

const RefinementListWithTitle = ({title, item}) =>
  <div>
    <div className="facet-title">{title}</div>
    {item}
  </div>;

const CustomCheckbox = ({query, refine}) =>
    <div className="input-group">
      <input type="text"
             value={query}
             onChange={e => refine(e.target.value)}
             className="form-control"
             id="q"/>
      <span className="input-group-btn">
      <button className="btn btn-default"><i className="fa fa-search"></i></button>
    </span>
    </div>
  ;

const ColorItem = ({item, selectedItems, createURL, refine}) => {
  const selected = selectedItems.indexOf(item.value) !== -1;
  const active = selected ? 'checked' : '';
  const value = selected ?
    selectedItems.filter(v => v !== item.value) :
    selectedItems.concat([item.value]);
  return (
    <a
      key={item.value}
      className={`${active} facet-color`}
      href={createURL(value)}
      onClick={e => {
        e.preventDefault();
        refine(value);
      }}
      data-facet-value={item.value}
    >
    </a>
  );
};

const CustomColorRefinementList = ({items, selectedItems, refine, createURL}) =>
    <div>
      {items.map(item =>
        <ColorItem
          key={item.value}
          item={item}
          selectedItems={selectedItems}
          refine={refine}
          createURL={createURL}
        />
      )}
    </div>
  ;

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
    icons.push(<label key={i} label className={`ais-RangeRatings__ratingIcon${suffix}`}></label>);
  }
  return (
    <article className="hit">
      <div className="product-picture-wrapper">
        <div className="product-picture"><img src={`${item.image}`}/></div>
      </div>
      <div className="product-desc-wrapper">
        <div className="product-name" dangerouslySetInnerHTML={{__html: item._highlightResult.name.value}}/>
        <div className="product-type" dangerouslySetInnerHTML={{__html: item._highlightResult.type.value}}/>
        <div className="ais-RangeRatings__ratingLink">
          {icons}
          <div className="product-price">${item.price}</div>
        </div>
      </div>
    </article>);
};

const CustomResults = createConnector({
  displayName: 'CustomResults',

  getProps(props, state, search) {
    const noResults = search.results ? search.results.nbHits === 0 : false;
    return {query: state.q, noResults};
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
              defaultSelectedIndex="ikea"
            />
          </div>
          <Stats />
        </section>
        <ConnectedHits hitsPerPage={16}/>
        <footer><Pagination showLast={true}/></footer>
      </div>
    );
  }
});

const CustomPriceRanges = MultiRange.connect(React.createClass({
  checkIfNeedReset(value) {
    const selectedItem = this.props.selectedItem === value ? '' : value;
    this.props.refine(selectedItem);
  },

  filteredItems(items){
    let filteredItems = items;
    if (!(this.props.selectedItem === '')) {
      filteredItems = items.filter(i => this.props.selectedItem === i.value);
    }
    return filteredItems;
  },

  render() {
    const {items, refine} = this.props;
    const ranges = this.filteredItems(items).map(item => {
      const min = parseFloat(item.value.split(':')[0]);
      const max = parseFloat(item.value.split(':')[1]);

      let label;
      if (Number.isNaN(min)) {
        label = `≤$${max}`;
      } else if (Number.isNaN(max)) {
        label = `≥$${min}`;
      } else {
        label = `$${min} - $${max}`;
      }

      return <PriceRange label={label} key={item.value} value={item.value}
                         refine={refine} onClick={this.checkIfNeedReset}/>;
    });

    return (
      <ul className="ais-price-ranges--list">
        {ranges}
      </ul>
    );
  },
}));

const PriceRange = ({label, value, onClick}) =>
  <li className="ais-price-ranges--item">
    <a
      key={value}
      onClick={onClick.bind(null, value)}
      className="ais-price-ranges--link"
    >
      {label}
    </a>
  </li>;

const ConnectedSearchBox = SearchBox.connect(CustomCheckbox);

const ConnectedColorRefinementList = RefinementList.connect(CustomColorRefinementList);

const ConnectedHits = Hits.connect(CustomHits);
