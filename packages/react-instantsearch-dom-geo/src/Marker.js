import { Component } from 'react';
import PropTypes from 'prop-types';
import {
  registerEvents,
  createListenersPropTypes,
  createFilterProps,
} from './utils';
import { GeolocHitPropType } from './propTypes';
import { GOOGLE_MAPS_CONTEXT } from './GoogleMaps';

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

class Marker extends Component {
  static propTypes = {
    ...createListenersPropTypes(eventTypes),
    hit: GeolocHitPropType.isRequired,
  };

  static contextTypes = {
    [GOOGLE_MAPS_CONTEXT]: PropTypes.shape({
      google: PropTypes.object,
      instance: PropTypes.object,
    }),
  };

  componentDidMount() {
    const { hit, ...props } = this.props;
    const { google, instance } = this.context[GOOGLE_MAPS_CONTEXT];

    this.instance = new google.maps.Marker({
      ...filterProps(props),
      map: instance,
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

export default Marker;
