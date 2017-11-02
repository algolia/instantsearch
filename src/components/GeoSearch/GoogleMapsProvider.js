/* global google */

import { flowRight } from 'lodash';
import React, { Component } from 'preact-compat';
import PropTypes from 'prop-types';
import {
  withScriptjs,
  withGoogleMap,
  GoogleMap,
  Marker,
} from 'react-google-maps';
import { getBoundsZoomLevel } from './utils';

class GoogleMapsProvider extends Component {
  static propTypes = {
    markers: PropTypes.arrayOf(
      PropTypes.shape({
        objectID: PropTypes.string.isRequired,
        _geoloc: PropTypes.shape({
          lat: PropTypes.number.isRequired,
          lng: PropTypes.number.isRequired,
        }).isRequired,
      }).isRequired
    ).isRequired,
    refine: PropTypes.func.isRequired,
    clearRefinementWithMap: PropTypes.func.isRequired,
    isRefinedWithMap: PropTypes.bool.isRequired,
    isRefinePositionChanged: PropTypes.bool.isRequired,
    enableRefineOnMapMove: PropTypes.bool.isRequired,
    enableControlRefineWithMap: PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    this.hasMapMoveSinceLastRefine = false;

    const markers = this.computeMarkerWithLatLng(props.markers);
    const nextState = {
      enableRefineOnMapMove: props.enableRefineOnMapMove,
      markers,
    };

    if (markers.length) {
      const bounds = this.computeBoundsFromMarker(markers);

      nextState.zoom = this.computeZoomFromBounds(bounds);
      nextState.center = bounds.getCenter();
    }

    this.state = nextState;
  }

  componentWillReceiveProps(nextProps) {
    const markers = this.computeMarkerWithLatLng(nextProps.markers);
    const nextState = {
      markers,
    };

    // Restore hasMapMoveSinceLastRefine when refinement change
    // but the refinement is not with the map
    // ex: with places we can set the refinement with the
    // autocomplete bar & we can move the map without
    // the refine action
    if (nextProps.isRefinePositionChanged && !nextProps.isRefinedWithMap) {
      this.hasMapMoveSinceLastRefine = false;
    }

    // Avoid the state? Probably don't need it since the map has
    // it's own state and we read everything from it.
    if (markers.length && !nextProps.isRefinedWithMap) {
      const bounds = this.computeBoundsFromMarker(markers);

      nextState.zoom = this.computeZoomFromBounds(bounds);
      nextState.center = bounds.getCenter();
    }

    this.setState(nextState);
  }

  computeMarkerWithLatLng(markers) {
    return markers.map(({ _geoloc, ...marker }) => ({
      ...marker,
      _position: new google.maps.LatLng(_geoloc.lat, _geoloc.lng),
    }));
  }

  computeBoundsFromMarker(markers) {
    return markers.reduce(
      (acc, marker) => acc.extend(marker._position),
      new google.maps.LatLngBounds()
    );
  }

  computeZoomFromBounds(bounds) {
    return getBoundsZoomLevel(bounds, {
      width: 625,
      height: 350,
    });
  }

  refine = () => {
    this.hasMapMoveSinceLastRefine = false;

    const ne = this.map.getBounds().getNorthEast();
    const sw = this.map.getBounds().getSouthWest();

    this.props.refine({
      ne: { lat: ne.lat(), lng: ne.lng() },
      sw: { lat: sw.lat(), lng: sw.lng() },
    });
  };

  onChange = () => {
    this.hasMapMoveSinceLastRefine = true;

    this.setState({
      center: this.map.getCenter(),
      zoom: this.map.getZoom(),
    });
  };

  onChangeWithRefine = () => {
    if (this.state.enableRefineOnMapMove) {
      this.refine();
    }

    this.onChange();
  };

  onDragEnd = () => {
    if (this.state.enableRefineOnMapMove) {
      this.refine();
    }
  };

  onChangeMapMoveControl = event => {
    this.setState({
      enableRefineOnMapMove: event.currentTarget.checked,
    });
  };

  renderRedoSearchHere = () => (
    <button onClick={this.refine} disabled={!this.hasMapMoveSinceLastRefine}>
      Redo search here
    </button>
  );

  render() {
    const { zoom, center, markers, enableRefineOnMapMove } = this.state;

    const {
      clearRefinementWithMap,
      isRefinedWithMap,
      enableControlRefineWithMap,
    } = this.props;

    return (
      <div>
        <GoogleMap
          ref={c => (this.map = c)}
          zoom={zoom}
          center={center}
          onCenterChanged={this.onChange}
          onZoomChanged={this.onChangeWithRefine}
          onDragEnd={this.onDragEnd}
          defaultOptions={{
            gestureHandling: 'cooperative',
            mapTypeControl: false,
            streetViewControl: false,
          }}
        >
          {markers.map(({ objectID, _position }) => (
            <Marker key={objectID} position={_position} />
          ))}
        </GoogleMap>

        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <button
            onClick={() => {
              this.hasMapMoveSinceLastRefine = false;
              clearRefinementWithMap();
            }}
            disabled={!isRefinedWithMap}
          >
            Clear the refinement with the current map view
          </button>

          {enableControlRefineWithMap && (
            <div>
              {enableRefineOnMapMove || !this.hasMapMoveSinceLastRefine ? (
                <label>
                  <input
                    type="checkbox"
                    checked={enableRefineOnMapMove}
                    onChange={this.onChangeMapMoveControl}
                  />
                  Search as I move the map
                </label>
              ) : (
                this.renderRedoSearchHere()
              )}
            </div>
          )}

          {!enableControlRefineWithMap &&
            !enableRefineOnMapMove &&
            this.renderRedoSearchHere()}
        </div>
      </div>
    );
  }
}

export default flowRight(withScriptjs, withGoogleMap)(GoogleMapsProvider);
