/* eslint react/prop-types: 0 */

import React from 'react';

import {
  InstantSearch,
  SearchBox as OriginalSearchBox,
  RefinementList,
  Hits,
  Stats,
  Pagination,
  Range,
} from 'react-instantsearch';

import paginationTheme from './pagination.css';

export default function App() {
  return <InstantSearch
    appId="latency"
    apiKey="6be0576ff61c053d5f9a3225e2a90f76"
    indexName="movies"
  >
    <div>
      <Header/>
      <section>
        <Facets/>
        <Results/>
      </section>
    </div>
  </InstantSearch>;
}

const Header = () =>
<header className="row">
  <a href="https://community.algolia.com/instantsearch.js/" className="is-logo">
  <img src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png" width="40" /></a>
  <a href="./" className="logo">You<i className="fa fa-youtube-play"></i></a>
  <SearchBox />
</header>;

const SearchBox = OriginalSearchBox.connect(
  ({query, refine}) =>
    <div className="searchbox-container">
      <div className="input-group">
        <input type="text"
          value={query}
          onChange={e => refine(e.target.value)}
          className="form-control"
        />
        <span className="input-group-btn">
          <button className="btn btn-default"><i className="fa fa-search"></i></button>
        </span>
      </div>
    </div>
);

const Facets = () => <aside>
  <ul className="nav nav-list panel">
    <li><a href="./"><i className="fa fa-home"></i> Home</a></li>
    <li className="separator"></li>
  </ul>
  <Panel title="Genres" id="genres"
  >
    <RefinementList.Links
      attributeName="genre"
      theme={{
        ...RefinementList.Links.defaultTheme,
        items: 'nav nav-list',
        itemCount: 'badge pull-right',
        itemLink: 'item',
        itemSelected: 'active',
      }}
      sortBy={['isRefined']}
    />
  </Panel>
  <Panel title="Rating" id="ratings">
    <Range.Rating attributeName="rating" max={5}/>
  </Panel>
  <div className="thank-you">Data courtesy of <a href="https://www.imdb.com/">imdb.com</a></div>
</aside>;

const Panel = ({title, children, id}) =>
<div id={id}>
  <h5><i className="fa fa-chevron-right"></i> {title}</h5>
  {children}
</div>;

const Star = ({active}) => <span className={`star${active ? '' : '__empty'}`} />;
const Stars = ({rating}) => {
  const stars = [];
  for (let i = 1; i <= 5; ++i) {
    stars.push(i <= rating);
  }
  return <span className="stars">{stars.map((active, idx) => <Star key={idx} active={active}/>)}</span>;
};
const Genre = ({name}) => <span className="badge">{name}</span>;
const Genres = ({genres}) => <p className="genre">{genres.map((genre, idx) => <Genre name={genre} key={idx} />)}</p>;

const Hit = ({
  hit: {
    image,
    _highlightResult: {
      title: {
        value: title,
      },
    },
    rating,
    year,
    genre,
  },
}) =>
  <div className="hit media">
    <div className="media-left">
      <div className="media-object" style={{backgroundImage: `url(${image})`}}></div>
    </div>
    <div className="media-body">
      <h4 className="media-heading">
        <span dangerouslySetInnerHTML={{__html: title}}/>
        <Stars rating={rating}/>
      </h4>
      <p className="year">{year}</p>
      <Genres genres={genre} />
    </div>
  </div>;

const Results = () =>
  <article>
    <div id="stats" className="text-right text-muted"><Stats/></div>
    <hr />
    <div id="hits"><Hits itemComponent={Hit} hitsPerPage={10} /></div>
    <div id="pagination" className="text-center"><Pagination theme={paginationTheme.classNames}/></div>
  </article>;
