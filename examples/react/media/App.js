import algoliasearch from 'algoliasearch/lite';
import React from 'react';
import * as ReactInstantSearch from 'react-instantsearch-dom';

import withURLSync from './URLSync';
import './App.css';

// Due to a bug in Webpack, we destructure here instead of using named imports
const {
  InstantSearch,
  Hits,
  Stats,
  Pagination,
  RatingMenu,
  Highlight,
  Configure,
  connectSearchBox,
  connectRefinementList,
} = ReactInstantSearch;

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const App = (props) => (
  <InstantSearch
    searchClient={searchClient}
    indexName="movies"
    searchState={props.searchState}
    createURL={props.createURL}
    onSearchStateChange={props.onSearchStateChange}
  >
    <Configure hitsPerPage={10} />
    <Header />
    <section>
      <Facets />
      <Results />
    </section>
  </InstantSearch>
);

const Header = () => (
  <header>
    <a
      href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/"
      className="is-logo"
    >
      <img
        alt="React InstantSearch"
        src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
        width="40"
      />
    </a>
    <a href="./" className="logo">
      You
      <i className="fa fa-youtube-play" />
    </a>
    <SearchBox />
  </header>
);

const SearchBox = connectSearchBox(({ currentRefinement, refine }) => (
  <div className="searchbox-container">
    <div className="input-group">
      <input
        type="text"
        value={currentRefinement}
        onChange={(e) => refine(e.target.value)}
        autoComplete="off"
        className="form-control"
      />
      <span className="input-group-btn">
        <button className="btn btn-default">
          <i className="fa fa-search" />
        </button>
      </span>
    </div>
  </div>
));

const Facets = () => (
  <aside>
    <ul className="nav nav-list panel">
      <li>
        <a href="./">
          <i className="fa fa-home" /> Home
        </a>
      </li>
      <li className="separator" />
    </ul>
    <Panel title="Genres" id="genres">
      <RefinementListLinks attribute="genre" />
    </Panel>
    <Panel title="Rating" id="ratings">
      <RatingMenu attribute="rating" max={5} />
    </Panel>
    <div className="thank-you">
      {' '}
      Data courtesy of <a href="https://www.imdb.com/">imdb.com</a>
    </div>
  </aside>
);

const Panel = ({ title, children, id }) => (
  <div id={id}>
    <h5>
      <i className="fa fa-chevron-right" /> {title}
    </h5>
    {children}
  </div>
);

const Star = ({ active }) => (
  <span className={`star${active ? '' : '__empty'}`} />
);
const Stars = ({ rating }) => {
  const stars = [];
  for (let i = 1; i <= 5; ++i) {
    stars.push(i <= rating);
  }
  return (
    <span className="stars">
      {stars.map((active, idx) => (
        <Star key={idx} active={active} />
      ))}
    </span>
  );
};
const Genre = ({ name }) => <span className="badge">{name}</span>;
const Genres = ({ genres }) => (
  <p className="genre">
    {genres.map((genre, idx) => (
      <Genre name={genre} key={idx} />
    ))}
  </p>
);

const Hit = (hit) => {
  const { image, rating, year, genre } = hit.hit;
  return (
    <div className="hit media">
      <div className="media-left">
        <div
          className="media-object"
          style={{ backgroundImage: `url(${image})` }}
        />
      </div>
      <div className="media-body">
        <h4 className="media-heading">
          <Highlight attribute="title" hit={hit.hit} />
          <Stars rating={rating} />
        </h4>
        <p className="year">{year}</p>
        <Genres genres={genre} />
      </div>
    </div>
  );
};

const Results = connectSearchBox(() => (
  <article>
    <div id="stats" className="text-right text-muted">
      <Stats />
    </div>
    <hr />
    <div id="hits">
      <Hits hitComponent={Hit} />
    </div>
    <div id="pagination" className="text-center">
      <Pagination />
    </div>
  </article>
));

const RefinementListLinks = connectRefinementList(
  ({ items, refine, createURL }) => {
    const hitComponents = items.map((item) => (
      <div className={item.isRefined ? ' active' : ''} key={item.label}>
        <a
          className="item"
          href={createURL(item.value)}
          onClick={(e) => {
            e.preventDefault();
            refine(item.value);
          }}
        >
          <span> {item.label}</span>
          <span className="badge pull-right">{item.count}</span>
        </a>
      </div>
    ));

    return <div className="nav nav-list">{hitComponents}</div>;
  }
);

export default withURLSync(App);
