import {InstantSearch, Hits, SearchBox, Pagination, Range} from 'react-instantsearch';
import React, {Component, PropTypes} from 'react';
import ReactDOM from 'react-dom';

class TourismInstantsearchSample extends Component {
  render() {
    return (
      <InstantSearch
        appId="latency"
        apiKey="6be0576ff61c053d5f9a3225e2a90f76"
        indexName="airbnb"
      >
        <div>
          <Header />
          <Filters />
          <Results />
        </div>
      </InstantSearch>
    );
  }
}

class Header extends Component {
  render() {
    const containerStyle = {
      paddingLeft: 0,
      paddingRight: 0,
    };
    return (
      <div className="container-fluid" style={containerStyle}>
        <header className="navbar navbar-static-top aisdemo-navbar">
          <a href="https://community.algolia.com/instantsearch.js/" className="is-logo"><img src="logo-is.png" width={40} /></a>
          <a href="./" className="logo">A</a>
          <i className="fa fa-search"></i>
          <SearchBox />
        </header>
      </div>
    );
  }
}

class Filters extends Component {
  render() {
    return (
      <div className="container-fluid">
        <div className="row">
          <div className="col-sm-7 aisdemo--left-column">

            <div className="aisdemo-filters">
              <DatesAndGuest />
              <RoomType />
              <Price />
            </div>

            <div className="row">
              <div id="stats"></div>
            </div>
          </div>

          <div className="col-sm-5 aisdemo--right-column">
            <div id="map"></div>
          </div>
        </div>
      </div>
    );
  }
}

class DatesAndGuest extends Component {
  render() {
    return (
      <div className="row aisdemo-filter">
        <div className="col-sm-2 aisdemo-filter-title">Dates</div>
        <div className="col-sm-3"><input className="date form-control" value="10/30/3015" disabled /></div>
        <div className="col-sm-3"><input className="date form-control" value="10/30/3015" disabled /></div>
        <div className="col-sm-3"><div id="guests"></div></div>
      </div>
    );
  }
}

class RoomType extends Component {
  render() {
    return (
      <div className="row aisdemo-filter">
        <div className="col-sm-2 aisdemo-filter-title">Room Type</div>
        <div id="room_types"></div>
      </div>
    );
  }
}

class Price extends Component {
  render() {
    return (
      <div className="row aisdemo-filter">
        <div className="col-sm-2 aisdemo-filter-title">Price Range</div>
        <Range attributeName="price" />
      </div>
    );
  }
}

const MyHits = Hits.connect(props => {
  const hs = props.hits.map(hit => <HitComponent key={hit.objectID} hit={hit} />);
  return <div id="hits">{hs}</div>;
});

function HitComponent({hit}) {
  const description = `${hit.room_type} - ${hit._highlightResult.city.value}, ${hit._highlightResult.country.value}`;
  const title = `${hit._highlightResult.name.value}`;
  return (
    <div className="hit col-sm-3">
      <div className="pictures-wrapper">
        <img className="picture" src={hit.picture_url} />
        <img className="profile" src={hit.user.user.thumbnail_url} />
      </div>
      <div className="infos">
      <h4 className="media-heading" dangerouslySetInnerHTML={{__html: title}}></h4>
      <p dangerouslySetInnerHTML={{__html: description}}></p>
      </div>
    </div>
  );
}

HitComponent.propTypes = {
  hit: PropTypes.object,
};

class Results extends Component {
  render() {
    return (
      <div className="container-fluid" id="results">
        <div className="row">
          <MyHits/>
        </div>
        <div className="row">
          <Pagination />
          <div className="thank-you">Data from <a href="https://www.airbnb.com/">airbnb.com</a>, user pics from <a href="https://randomuser.me/">randomuser.me</a></div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<TourismInstantsearchSample/>, document.querySelector('.content'));
