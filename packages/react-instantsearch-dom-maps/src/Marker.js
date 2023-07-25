import PropTypes from 'prop-types';
import { Component } from 'react';

import { GeolocHitPropType } from './propTypes';
import {
  registerEvents,
  createListenersPropTypes,
  createFilterProps,
} from './utils';
import withGoogleMaps from './withGoogleMaps';

const eventTypes = {
  onClick: 'click',
  onDoubleClick: 'dblclick',
  onMouseDown: 'mousedown',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
};

const excludes = ['children'].concat(Object.keys(eventTypes));
const filterProps = createFilterProps(excludes);

export class Marker extends Component {
  static propTypes = {
    ...createListenersPropTypes(eventTypes),
    google: PropTypes.object.isRequired,
    googleMapsInstance: PropTypes.object.isRequired,
    hit: GeolocHitPropType.isRequired,
  };

  componentDidMount() {
    const { google, googleMapsInstance, hit, ...props } = this.props;

    this.instance = new google.maps.Marker({
      ...filterProps(props),
      map: googleMapsInstance,
      position: hit._geoloc,
    });

    this.removeEventsListeners = registerEvents(
      eventTypes,
      this.props,
      this.instance
    );
  }

  componentDidUpdate() {
    this.removeEventsListeners();

    this.removeEventsListeners = registerEvents(
      eventTypes,
      this.props,
      this.instance
    );
  }

  componentWillUnmount() {
    this.instance.setMap(null);
  }

  render() {
    return null;
  }
}

export default withGoogleMaps(Marker);
