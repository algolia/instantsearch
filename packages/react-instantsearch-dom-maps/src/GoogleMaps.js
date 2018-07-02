import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createClassNames } from 'react-instantsearch-dom';
import { LatLngPropType, BoundingBoxPropType } from './propTypes';

const cx = createClassNames('GeoSearch');

export const GOOGLE_MAPS_CONTEXT = '__ais_geo_search__google_maps__';

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

  static childContextTypes = {
    [GOOGLE_MAPS_CONTEXT]: PropTypes.shape({
      google: PropTypes.object,
      instance: PropTypes.object,
    }),
  };

  isUserInteraction = true;
  isPendingRefine = false;
  listeners = [];

  state = {
    isMapReady: false,
  };

  getChildContext() {
    const { google } = this.props;

    return {
      [GOOGLE_MAPS_CONTEXT]: {
        instance: this.instance,
        google,
      },
    };
  }

  componentDidMount() {
    const { google, mapOptions } = this.props;

    this.instance = new google.maps.Map(this.element, {
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
      this.lockUserInteration(() => {
        this.instance.fitBounds(
          new google.maps.LatLngBounds(
            boundingBox.southWest,
            boundingBox.northEast
          ),
          boundingBoxPadding
        );
      });
    } else {
      this.lockUserInteration(() => {
        this.instance.setZoom(initialZoom);
        this.instance.setCenter(initialPosition);
      });
    }
  }

  componentWillUnmount() {
    this.listeners.forEach(listener => {
      listener.remove();
    });

    this.listeners = [];
  }

  setupListenersWhenMapIsReady = () => {
    this.listeners = [];

    this.setState(() => ({
      isMapReady: true,
    }));

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

  lockUserInteration(functionThatAltersTheMapPosition) {
    this.isUserInteraction = false;
    functionThatAltersTheMapPosition();
    this.isUserInteraction = true;
  }

  render() {
    const { children } = this.props;
    const { isMapReady } = this.state;

    return (
      <div className={cx('')}>
        <div ref={c => (this.element = c)} className={cx('map')} />
        {isMapReady && children}
      </div>
    );
  }
}

export default GoogleMaps;
