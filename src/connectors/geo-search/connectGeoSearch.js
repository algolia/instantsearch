import { checkRendering } from '../../lib/utils.js';

const usage = `Usage:
var customGeoSearch = connectGeoSearch(function render(params, isFirstRendering) {
  // Fill corresponding values
});

search.addWidget(
  customGeoSearch({
    // Fill corresponding values
  })
);

Full documentation available at https://community.algolia.com/instantsearch.js/connectors/connectGeoSearch.html
`;

export default function connectGeoSearch(renderFn, unmountFn) {
  checkRendering(renderFn, usage);

  return (widgetParams = {}) => ({
    getConfiguration(previous) {
      const configuration = {};

      const {
        enableGeolocationWithIP,
        position,
        radius,
        precision,
      } = widgetParams;

      if (
        enableGeolocationWithIP &&
        !position &&
        !previous.hasOwnProperty('aroundLatLngViaIP') &&
        !previous.aroundLatLng
      ) {
        configuration.aroundLatLngViaIP = true;
      }

      if (position && !previous.aroundLatLng && !previous.aroundLatLngViaIP) {
        configuration.aroundLatLng = `${position.lat}, ${position.lng}`;
      }

      if (radius && !previous.hasOwnProperty('aroundRadius')) {
        configuration.aroundRadius = radius;
      }

      if (precision && !previous.hasOwnProperty('aroundPrecision')) {
        configuration.aroundPrecision = precision;
      }

      return configuration;
    },

    init() {
      renderFn({}, true);
    },

    render() {
      renderFn({}, false);
    },

    dispose() {
      unmountFn();

      return {};
    },
  });
}
