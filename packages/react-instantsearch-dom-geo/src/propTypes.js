import PropTypes from 'prop-types';

export const LatLngPropType = PropTypes.shape({
  lat: PropTypes.number.isRequired,
  lng: PropTypes.number.isRequired,
});

export const BoundingBoxPropType = PropTypes.shape({
  northEast: LatLngPropType.isRequired,
  southWest: LatLngPropType.isRequired,
});

export const GeolocHitPropType = PropTypes.shape({
  _geoloc: LatLngPropType.isRequired,
});
