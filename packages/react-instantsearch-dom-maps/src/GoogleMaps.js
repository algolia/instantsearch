import PropTypes from 'prop-types';
import React, { Component, createRef } from 'react';
import { createClassNames } from 'react-instantsearch-dom';

import GoogleMapsContext from './GoogleMapsContext';
import { LatLngPropType, BoundingBoxPropType } from './propTypes';

const cx = createClassNames('GeoSearch');

class GoogleMaps extends Component {
  static propTypes = {
    google: PropTypes.object.isRequired,
    initialZoom: PropTypes.number.isRequired,
    initialPosition: LatLngPropType.isRequired,
    mapOptions: PropTypes.object.isRequired,
    onChange: PropTypes.func.isRequired,
    onIdle: PropTypes.func.isRequired,
    shouldUpdate: PropTypes.func.isRequired,
    boundingBox: BoundingBoxPropType,
    boundingBoxPadding: PropTypes.number,
    children: PropTypes.node,
  };

  isUserInteraction = true;
  isPendingRefine = false;
  listeners = [];
  mapRef = createRef();

  state = {
    isMapReady: false,
  };

  componentDidMount() {
    const { google, mapOptions } = this.props;

    this.instance = new google.maps.Map(this.mapRef.current, {
      mapTypeControl: false,
      fullscreenControl: false,
      streetViewControl: false,
      clickableIcons: false,
      zoomControlOptions: {
        position: google.maps.ControlPosition.LEFT_TOP,
      },
      ...mapOptions,
    });

    this.listeners.push(
      google.maps.event.addListenerOnce(
        this.instance,
        'idle',
        this.setupListenersWhenMapIsReady
      )
    );
  }

  componentDidUpdate() {
    const {
      google,
      initialZoom,
      initialPosition,
      boundingBox,
      boundingBoxPadding,
      shouldUpdate,
    } = this.props;

    if (!shouldUpdate()) {
      return;
    }

    if (boundingBox) {
      this.lockUserInteraction(() => {
        const oldBounds = this.instance.getBounds();

        // south west and north east are swapped
        const newBounds = new google.maps.LatLngBounds(
          boundingBox.southWest,
          boundingBox.northEast
        );

        if (!newBounds.equals(oldBounds)) {
          this.instance.fitBounds(newBounds, boundingBoxPadding);
        }
      });
    } else {
      this.lockUserInteraction(() => {
        this.instance.setZoom(initialZoom);
        this.instance.setCenter(initialPosition);
      });
    }
  }

  componentWillUnmount() {
    this.listeners.forEach((listener) => {
      listener.remove();
    });

    this.listeners = [];
  }

  setupListenersWhenMapIsReady = () => {
    this.listeners = [];

    this.setState({
      isMapReady: true,
      value: {
        google: this.props.google,
        instance: this.instance,
      },
    });

    const onChange = () => {
      if (this.isUserInteraction) {
        this.props.onChange();
      }
    };

    this.listeners.push(this.instance.addListener('center_changed', onChange));
    this.listeners.push(this.instance.addListener('zoom_changed', onChange));
    this.listeners.push(this.instance.addListener('dragstart', onChange));

    this.listeners.push(
      this.instance.addListener('idle', () => {
        if (this.isUserInteraction) {
          this.props.onIdle({
            instance: this.instance,
          });
        }
      })
    );
  };

  lockUserInteraction(functionThatAltersTheMapPosition) {
    this.isUserInteraction = false;
    functionThatAltersTheMapPosition();
    this.isUserInteraction = true;
  }

  render() {
    const { children } = this.props;
    const { isMapReady } = this.state;

    return (
      <div className={cx('')}>
        <div ref={this.mapRef} className={cx('map')} />
        {isMapReady && (
          <GoogleMapsContext.Provider value={this.state.value}>
            {children}
          </GoogleMapsContext.Provider>
        )}
      </div>
    );
  }
}

export default GoogleMaps;
