import algoliasearch from 'algoliasearch/lite';
import PropTypes from 'prop-types';
import React, { Component, Fragment } from 'react';
import {
  InstantSearch,
  ClearRefinements,
  SearchBox,
  Pagination,
  Highlight,
  Configure,
  connectHits,
  connectNumericMenu,
  connectRefinementList,
  connectRange,
} from 'react-instantsearch-dom';
import {
  GoogleMapsLoader,
  GeoSearch,
  Marker,
} from 'react-instantsearch-dom-maps';
import Rheostat from 'rheostat';

import withURLSync from './URLSync';
import './App.css';

const searchClient = algoliasearch(
  'latency',
  '6be0576ff61c053d5f9a3225e2a90f76'
);

const App = (props) => (
  <InstantSearch
    searchClient={searchClient}
    indexName="airbnb"
    searchState={props.searchState}
    createURL={props.createURL}
    onSearchStateChange={props.onSearchStateChange}
  >
    <Configure aroundLatLngViaIP={true} />
    <Header />
    <Filters />
    <Results />
  </InstantSearch>
);

function Header() {
  return (
    <header className="navbar navbar-static-top aisdemo-navbar">
      <a
        href="https://www.algolia.com/doc/guides/building-search-ui/what-is-instantsearch/react/"
        className="is-logo"
      >
        <img
          alt="React InstantSearch"
          src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png"
          width={40}
        />
      </a>
      <a href="./" className="logo">
        BnB
      </a>
      <i className="fa fa-search" />
      <SearchBox />
    </header>
  );
}

function Filters() {
  return (
    <Fragment>
      <div className="search-filters">
        <div className="aisdemo--left-column">
          <div className="aisdemo-filters">
            <DatesAndGuest />
            <Capacity />
            <RoomType attribute="room_type" operator="or" limit={3} />
            <Price />
          </div>

          <div className="row">
            <div id="stats" />
          </div>
        </div>

        <div className="aisdemo--right-column">
          <GoogleMapsLoader
            apiKey="AIzaSyBawL8VbstJDdU5397SUX7pEt9DslAwWgQ"
            endpoint="https://maps.googleapis.com/maps/api/js?v=weekly"
          >
            {(google) => (
              <GeoSearch google={google} minZoom={2}>
                {({ hits }) => (
                  <Fragment>
                    {hits.map((hit) => (
                      <Marker key={hit.objectID} hit={hit} />
                    ))}
                    <ClearRefinements
                      className="ClearGeoRefinement"
                      transformItems={(items) =>
                        items.filter((item) => item.id === 'boundingBox')
                      }
                      translations={{
                        reset: 'Clear the map refinement',
                      }}
                    />
                  </Fragment>
                )}
              </GeoSearch>
            )}
          </GoogleMapsLoader>
        </div>
      </div>
    </Fragment>
  );
}

function Capacity() {
  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Capacity</div>
      <div className="col-sm-3">
        <CapacitySelector
          attribute="person_capacity"
          items={[
            { label: '1 guest', start: 1, end: 1 },
            { label: '2 guests', start: 2, end: 2 },
            { label: '3 guests', start: 3, end: 3 },
            { label: '4 guests', start: 4, end: 4 },
            { label: '5 guests', start: 5, end: 5 },
            { label: '6 guests', start: 6, end: 6 },
          ]}
        />
      </div>
    </div>
  );
}

function OptionCapacity({ label, value }) {
  return <option value={value}>{label}</option>;
}

OptionCapacity.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

const CapacitySelector = connectNumericMenu(
  ({ items, currentRefinement, refine }) => {
    const selectValue = (e) => refine(e.target.value);
    const options = items.map((item) => (
      <OptionCapacity
        label={item.label}
        value={item.value}
        isSelected={item.isRefined}
        key={item.value}
      />
    ));

    return (
      <div className="capacity-menu-wrapper">
        <select defaultValue={currentRefinement} onChange={selectValue}>
          {options}
        </select>
      </div>
    );
  }
);

function DatesAndGuest() {
  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Dates</div>
      <div className="col-sm-3">
        <input className="date form-control" value="10/30/3015" disabled />
      </div>
      <div className="col-sm-3">
        <input className="date form-control" value="10/30/3015" disabled />
      </div>
      <div className="col-sm-3" />
    </div>
  );
}

const RoomType = connectRefinementList(({ items, refine }) => {
  const sortedItems = items.sort((i1, i2) => i1.label.localeCompare(i2.label));
  const hitComponents = sortedItems.map((item) => {
    const selectedClassName = item.isRefined
      ? ' ais-refinement-list--item__active'
      : '';
    const itemClassName = `ais-refinement-list--item col-sm-3 ${selectedClassName}`;
    return (
      <div className={itemClassName} key={item.label}>
        <div>
          <label
            className="ais-refinement-list--label"
            onClick={(e) => {
              e.preventDefault();
              refine(item.value);
            }}
          >
            <input
              type="checkbox"
              className="ais-refinement-list--checkbox"
              defaultChecked={item.isRefined ? 'checked' : ''}
            />
            {item.label}
            <span className="ais-refinement-list--count">{item.count}</span>
          </label>
        </div>
      </div>
    );
  });

  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Room Type</div>
      <div id="room_types col-sm-3">{hitComponents}</div>
    </div>
  );
});

function Price() {
  return (
    <div className="row aisdemo-filter rheostat-container">
      <div className="col-sm-2 aisdemo-filter-title">Price Range</div>
      <div className="col-sm-9">
        <ConnectedRange attribute="price" />
      </div>
    </div>
  );
}

const MyHits = connectHits(({ hits }) => {
  const hs = hits.map((hit) => <HitComponent key={hit.objectID} hit={hit} />);
  return <div id="hits">{hs}</div>;
});

function HitComponent({ hit }) {
  return (
    <div className="hit col-sm-3">
      <div className="pictures-wrapper">
        <img className="picture" alt={hit.name} src={hit.picture_url} />
        <img
          className="profile"
          alt={hit.user.user.first_name}
          src={hit.user.user.thumbnail_url}
        />
      </div>
      <div className="infos">
        <h4 className="media-heading">
          <Highlight attribute="name" hit={hit} />
        </h4>
        <HitDescription hit={hit} />
      </div>
    </div>
  );
}

function HitDescription({ hit }) {
  return (
    <p>
      {hit.room_type} - <Highlight attribute="city" hit={hit} />,{' '}
      <Highlight attribute="country" hit={hit} />
    </p>
  );
}

HitComponent.propTypes = {
  hit: PropTypes.object,
};

function Results() {
  return (
    <div className="container-fluid" id="results">
      <div className="row">
        <MyHits />
      </div>
      <div className="row">
        <Pagination />
        <div className="thank-you">
          Data from <a href="https://www.airbnb.com/">airbnb.com</a>, user pics
          from <a href="https://randomuser.me/">randomuser.me</a>
        </div>
      </div>
    </div>
  );
}

class Range extends Component {
  static propTypes = {
    min: PropTypes.number,
    max: PropTypes.number,
    currentRefinement: PropTypes.object,
    refine: PropTypes.func.isRequired,
    canRefine: PropTypes.bool.isRequired,
  };

  state = { currentValues: { min: this.props.min, max: this.props.max } };

  componentDidUpdate(prevProps) {
    if (
      this.props.canRefine &&
      (prevProps.currentRefinement.min !== this.props.currentRefinement.min ||
        prevProps.currentRefinement.max !== this.props.currentRefinement.max)
    ) {
      this.setState({
        currentValues: {
          min: this.props.currentRefinement.min,
          max: this.props.currentRefinement.max,
        },
      });
    }
  }

  onValuesUpdated = (sliderState) => {
    this.setState({
      currentValues: { min: sliderState.values[0], max: sliderState.values[1] },
    });
  };

  onChange = (sliderState) => {
    if (
      this.props.currentRefinement.min !== sliderState.values[0] ||
      this.props.currentRefinement.max !== sliderState.values[1]
    ) {
      this.props.refine({
        min: sliderState.values[0],
        max: sliderState.values[1],
      });
    }
  };

  render() {
    const { min, max, currentRefinement } = this.props;
    const { currentValues } = this.state;
    return min !== max ? (
      <div>
        <Rheostat
          min={min}
          max={max}
          values={[currentRefinement.min, currentRefinement.max]}
          onChange={this.onChange}
          onValuesUpdated={this.onValuesUpdated}
        />
        <div className="rheostat-values">
          <div>{currentValues.min}</div>
          <div>{currentValues.max}</div>
        </div>
      </div>
    ) : null;
  }
}

const ConnectedRange = connectRange(Range);

export default withURLSync(App);
