import PropTypes from 'prop-types';
import React, { Component } from 'react';

import Connector from './Connector';
import GoogleMaps from './GoogleMaps';
import { LatLngPropType, BoundingBoxPropType } from './propTypes';
import Provider from './Provider';

class GeoSearch extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    children: PropTypes.func.isRequired,
    initialZoom: PropTypes.number,
    initialPosition: LatLngPropType,
    enableRefine: PropTypes.bool,
    enableRefineOnMapMove: PropTypes.bool,
    defaultRefinement: BoundingBoxPropType,
  };

  static defaultProps = {
    initialZoom: 1,
    initialPosition: { lat: 0, lng: 0 },
    enableRefine: true,
    enableRefineOnMapMove: true,
    defaultRefinement: null,
  };

  renderChildrenWithBoundFunction = ({ hits, position, ...rest }) => {
    const {
      google,
      children,
      initialZoom,
      initialPosition,
      enableRefine,
      enableRefineOnMapMove,
      defaultRefinement,
      ...mapOptions
    } = this.props;

    return (
      <Provider
        {...rest}
        testID="Provider"
        google={google}
        hits={hits}
        position={position}
        isRefineEnable={enableRefine}
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
    const { enableRefineOnMapMove, defaultRefinement } = this.props;

    return (
      <Connector
        testID="Connector"
        enableRefineOnMapMove={enableRefineOnMapMove}
        defaultRefinement={defaultRefinement}
      >
        {this.renderChildrenWithBoundFunction}
      </Connector>
    );
  }
}

export default GeoSearch;
