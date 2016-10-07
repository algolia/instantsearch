import {
  InstantSearch,
  Hits,
  SearchBox,
  Pagination,
  Range,
  RefinementList,
  MultiRange,
  overrideTheme,
} from 'react-instantsearch';
import React, {PropTypes} from 'react';
import GoogleMap from 'google-map-react';
import {fitBounds} from 'google-map-react/utils';

import sliderTheme from './slider.css';
import paginationTheme from './pagination.css';
import searchBoxTheme from './searchbox.css';

export default function TourismInstantsearchSample() {
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

function Header() {
  const containerStyle = {
    paddingLeft: 0,
    paddingRight: 0,
  };
  return (
    <div className="container-fluid" style={containerStyle}>
      <header className="navbar navbar-static-top aisdemo-navbar">
        <a href="./" className="is-logo">
          <img src="https://res.cloudinary.com/hilnmyskv/image/upload/w_100,h_100,dpr_2.0//v1461180087/logo-instantsearchjs-avatar.png" width={40} />
        </a>
        <a href="./" className="logo">A</a>
        <i className="fa fa-search"></i>
        <SearchBox theme={searchBoxTheme.classNames}/>
      </header>
    </div>
  );
}

function Filters() {
  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-sm-7 aisdemo--left-column">

          <div className="aisdemo-filters">
            <DatesAndGuest />
            <Capacity />
            <RoomType
              attributeName="room_type"
              operator="or"
              sortBy={['name:asc']}
              limitMin={3} />
            <Price />
          </div>

          <div className="row">
            <div id="stats"></div>
          </div>
        </div>

        <div className="col-sm-5 aisdemo--right-column">
          <ConnectedHitsMap />
        </div>
      </div>
    </div>
  );
}

function CustomMarker() {
  /*  eslint-disable max-len */
  return (
    <svg width="60" height="102" viewBox="0 0 102 60" className="marker">
      <g fill="none" fillRule="evenodd">
        <g transform="translate(-60, 0)" stroke="#8962B2" id="pin" viewBox="0 0 100 100">
          <path d="M157.39 34.315c0 18.546-33.825 83.958-33.825 83.958S89.74 52.86 89.74 34.315C89.74 15.768 104.885.73 123.565.73c18.68 0 33.825 15.038 33.825 33.585z" strokeWidth="5.53" fill="#E6D2FC"></path>
          <path d="M123.565 49.13c-8.008 0-14.496-6.498-14.496-14.52 0-8.017 6.487-14.52 14.495-14.52s14.496 6.503 14.496 14.52c0 8.022-6.487 14.52-14.495 14.52z" strokeWidth="2.765" fill="#FFF"></path>
        </g>
      </g>
    </svg>);
  /*  eslint-enable max-len */
}

function HitsMap({hits}) {
  const availableSpace = {
    width: document.body.getBoundingClientRect().width * 5 / 12,
    height: 400,
  };
  const boundingPoints = hits.reduce((bounds, hit) => {
    const pos = hit;
    if (pos.lat > bounds.nw.lat) bounds.nw.lat = pos.lat;
    if (pos.lat < bounds.se.lat) bounds.se.lat = pos.lat;

    if (pos.lng < bounds.nw.lng) bounds.nw.lng = pos.lng;
    if (pos.lng > bounds.se.lng) bounds.se.lng = pos.lng;
    return bounds;
  }, {
    nw: {lat: -85, lng: 180},
    se: {lat: 85, lng: -180},
  });
  const boundsConfig = fitBounds(boundingPoints, availableSpace);
  const markers = hits.map(hit => <CustomMarker lat={hit.lat} lng={hit.lng} key={hit.objectID}></CustomMarker>);
  const options = {
    minZoomOverride: true,
    minZoom: 2,
  };
  return (
    <GoogleMap
      options={() => options}
      bootstrapURLKeys={{
        key: 'AIzaSyAl60n7p07HYQK6lVilAe_ggwbBJFktNw8',
      }}
      center={boundsConfig.center}
      zoom={boundsConfig.zoom}
    >{markers}</GoogleMap>
  );
}

HitsMap.propTypes = {
  hits: PropTypes.array,
};

const ConnectedHitsMap = Hits.connect(HitsMap);

function Capacity() {
  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Capacity</div>
      <div className="col-sm-3">
        <CapacitySelector
          attributeName="person_capacity"
          items={[
            {label: '1 guest', start: 1, end: 1},
            {label: '2 guests', start: 2, end: 2},
            {label: '3 guests', start: 3, end: 3},
            {label: '4 guests', start: 4, end: 4},
            {label: '5 guests', start: 5, end: 5},
            {label: '6 guests', start: 6, end: 6},
          ]}
        />
      </div>
    </div>
  );
}

function OptionCapacity({label, value}) {
  return <option value={value}>{label}</option>;
}

OptionCapacity.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
};

const CapacitySelector = MultiRange.connect(({items, selectedItem, refine}) => {
  const selectValue = e => refine(e.target.value);

  const allOption = <OptionCapacity label="" value="" isSelected={Boolean(selectedItem)} key="all"/>;

  const options = items.map(item => {
    const isSelected = item.value === selectedItem;
    const val = parseFloat(item.value.split(':')[0]);
    const label = `${val} person${val > 1 ? 's' : ''}`;
    return <OptionCapacity label={label} value={item.value} isSelected={isSelected} key={item.value}/>;
  });

  options.unshift(allOption);

  return (
    <div className="capacity-menu-wrapper">
      <select defaultValue={selectedItem} onChange={selectValue}>
        {options}
      </select>
    </div>
  );
});

function DatesAndGuest() {
  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Dates</div>
      <div className="col-sm-3"><input className="date form-control" value="10/30/3015" disabled /></div>
      <div className="col-sm-3"><input className="date form-control" value="10/30/3015" disabled /></div>
      <div className="col-sm-3"></div>
    </div>
  );
}

const RoomType = RefinementList.connect(({items, refine, selectedItems}) => {
  const itemComponents = items.map(item => {
    const isSelected = selectedItems.indexOf(item.value) !== -1;
    const value = isSelected ?
      selectedItems.filter(v => v !== item.value) :
      selectedItems.concat([item.value]);
    const selectedClassName = isSelected ? ' ais-refinement-list--item__active' : '';
    const itemClassName = `ais-refinement-list--item col-sm-3 ${selectedClassName}`;
    return (
      <div className={itemClassName} key={item.value}>
        <div>
          <label className="ais-refinement-list--label" onClick={e => {
            e.preventDefault();
            refine(value);
          }}>
            <input
              type="checkbox"
              className="ais-refinement-list--checkbox"
              defaultChecked={isSelected ? 'checked' : ''}
              />
            {item.value}
            <span className="ais-refinement-list--count">{item.count}</span>
          </label>
        </div>
      </div>
    );
  });

  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Room Type</div>
      <div id="room_types col-sm-3">
        {itemComponents}
      </div>
    </div>
  );
});

function Price() {
  const theme = overrideTheme(Range, sliderTheme);
  return (
    <div className="row aisdemo-filter">
      <div className="col-sm-2 aisdemo-filter-title">Price Range</div>
      <div className="col-sm-9">
        <Range theme={theme} attributeName="price"/>
      </div>
    </div>
  );
}

const MyHits = Hits.connect(({hits}) => {
  const hs = hits.map(hit => <HitComponent key={hit.objectID} hit={hit} />);
  return <div id="hits">{hs}</div>;
});

function HitComponent({hit}) {
  const description = `${hit.room_type} - ${hit._highlightResult.city.value}, ${hit._highlightResult.country.value}`;
  const title = hit._highlightResult.name.value;
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

function Results() {
  return (
    <div className="container-fluid" id="results">
      <div className="row">
        <MyHits/>
      </div>
      <div className="row">
        <Pagination theme={paginationTheme.classNames}/>
        <div className="thank-you">
          Data from <a href="https://www.airbnb.com/">airbnb.com</a>,
          user pics from <a href="https://randomuser.me/">randomuser.me</a>
        </div>
      </div>
    </div>
  );
}
