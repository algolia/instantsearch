import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { LatLngPropType } from './propTypes';
import Connector from './Connector';
import Provider from './Provider';
import GoogleMaps from './GoogleMaps';

class GeoSearch extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,
    initialZoom: PropTypes.number,
    initialPosition: LatLngPropType,
  };

  static defaultProps = {
    initialZoom: 1,
    initialPosition: {
      lat: 0,
      lng: 0,
    },
  };

  renderChildrenWithBoundFunction = ({ hits, position, ...rest }) => {
    const {
      google,
      children,
      initialZoom,
      initialPosition,
      ...mapOptions
    } = this.props;

    return (
      <Provider
        {...rest}
        testID="Provider"
        google={google}
        hits={hits}
        position={position}
      >
        {({
          boundingBox,
          boundingBoxPadding,
          onChange,
          onIdle,
          shouldUpdate,
        }) => (
          <GoogleMaps
            testID="GoogleMaps"
            google={google}
            initialZoom={initialZoom}
            initialPosition={position || initialPosition}
            mapOptions={mapOptions}
            boundingBox={boundingBox}
            boundingBoxPadding={boundingBoxPadding}
            onChange={onChange}
            onIdle={onIdle}
            shouldUpdate={shouldUpdate}
          >
            {children({ hits })}
          </GoogleMaps>
        )}
      </Provider>
    );
  };

  render() {
    return (
      <Connector testID="Connector">
        {this.renderChildrenWithBoundFunction}
      </Connector>
    );
  }
}

export default GeoSearch;
