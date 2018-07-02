import { Component } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import createHTMLMarker from './elements/createHTMLMarker';
import { registerEvents, createListenersPropTypes } from './utils';
import { GeolocHitPropType } from './propTypes';
import { GOOGLE_MAPS_CONTEXT } from './GoogleMaps';

const eventTypes = {
  onClick: 'click',
  onDoubleClick: 'dblclick',
  onMouseDown: 'mousedown',
  onMouseEnter: 'mouseenter',
  onMouseLeave: 'mouseleave',
  onMouseMove: 'mousemove',
  onMouseOut: 'mouseout',
  onMouseOver: 'mouseover',
  onMouseUp: 'mouseup',
};

class CustomMarker extends Component {
  static propTypes = {
    ...createListenersPropTypes(eventTypes),
    hit: GeolocHitPropType.isRequired,
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    anchor: PropTypes.shape({
      x: PropTypes.number.isRequired,
      y: PropTypes.number.isRequired,
    }),
  };

  static contextTypes = {
    [GOOGLE_MAPS_CONTEXT]: PropTypes.shape({
      google: PropTypes.object,
      instance: PropTypes.object,
    }),
  };

  static defaultProps = {
    className: '',
    anchor: {
      x: 0,
      y: 0,
    },
  };

  static isReact16() {
    return typeof ReactDOM.createPortal === 'function';
  }

  state = {
    marker: null,
  };

  componentDidMount() {
    const { hit, className, anchor } = this.props;
    const { google, instance } = this.context[GOOGLE_MAPS_CONTEXT];
    // Not the best way to create the reference of the CustomMarker
    // but since the Google object is required didn't find another
    // solution. Ideas?
    const Marker = createHTMLMarker(google);

    const marker = new Marker({
      map: instance,
      position: hit._geoloc,
      className,
      anchor,
    });

    this.removeListeners = registerEvents(eventTypes, this.props, marker);

    this.setState(() => ({
      marker,
    }));
  }

  componentDidUpdate() {
    const { children } = this.props;
    const { marker } = this.state;

    this.removeListeners();

    this.removeListeners = registerEvents(eventTypes, this.props, marker);

    if (!CustomMarker.isReact16()) {
      ReactDOM.unstable_renderSubtreeIntoContainer(
        this,
        children,
        marker.element
      );
    }
  }

  componentWillUnmount() {
    const { marker } = this.state;

    if (!CustomMarker.isReact16()) {
      ReactDOM.unmountComponentAtNode(marker.element);
    }

    marker.setMap(null);
  }

  render() {
    const { children } = this.props;
    const { marker } = this.state;

    if (!marker || !CustomMarker.isReact16()) {
      return null;
    }

    return ReactDOM.createPortal(children, marker.element);
  }
}

export default CustomMarker;
