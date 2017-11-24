import cx from 'classnames';
import { bemHelper } from '../../lib/utils.js';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import GoogleMapsRenderer from './GoogleMapsRenderer';
import LeafletRenderer from './LeafletRenderer';
import MapboxRenderer from './MapboxRenderer';

const bem = bemHelper('ais-geo');

// type Position = {
//   top: number,
//   right: number,
//   bottom: number,
//   left: number,
// };
//
// type CSSClasses = {
//   // TBD at the implementation
// };
//
// type Templates = {
//   clear: string,
//   toggle: string,
//   redo: string,
//   popup: string,
// };
//
// type MapOptions = {
//   // TBD -> GoogleMaps:MapOptions
//   // see: https://developers.google.com/maps/documentation/javascript/3.exp/reference#MapOptions
// };
//
// type MarkerOptions = {
//   // TBD -> GoogleMaps:MarkerOptions
//   // see: https://developers.google.com/maps/documentation/javascript/3.exp/reference#MarkerOptions
// };
//
// type PopupOptions = {
//   // TBD -> GoogleMaps:InfoWindowOptions (probably)
//   // see: https://developers.google.com/maps/documentation/javascript/3.exp/reference#InfoWindowOptions
// };
//
// type WidgetOptions = {
//   initialZoom?: number, // = 12 (may change)
//   initialPosition?: LatLng, // = SF (may change)
//   paddingBoundingBox?: Position, // = { 0, 0, 0, 0 }
//   cssClasses?: CSSClasses, // = {}
//   templates?: Templates, // = TBD
//   mapOptions?: MapOptions, // = {}
//   markerOptions?: MarkerOptions, // = {}
//   popupOptions?: PopupOptions, // = {}
//   enableRefineControl?: boolean, // = true
//   enableGeolocationWithIP?: boolean, // = true
//   enableRefineOnMapMove?: boolean, // = true
//   position?: LatLng,
//   radius?: number,
//   precision?: number,
// };

const geoSearch = renderer => (props = {}) => {
  const widgetParams = {
    enableRefineControl: true,
    cssClasses: {},
    paddingBoundingBox: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    ...props,
  };

  if (!widgetParams.container) {
    throw new Error(`Must provide a container.`);
  }

  try {
    const makeGeoSearch = connectGeoSearch(renderer);

    return makeGeoSearch({
      ...widgetParams,
      renderState: {},
      cssClasses: {
        root: cx(bem(null), widgetParams.cssClasses.root),
        item: cx(bem('item'), widgetParams.cssClasses.item),
        empty: cx(bem(null, 'empty'), widgetParams.cssClasses.empty),
      },
    });
  } catch (e) {
    throw new Error(`See usage.`);
  }
};

export const geoSearchWithGoogleMaps = geoSearch(GoogleMapsRenderer);
export const geoSearchWithLeaflet = geoSearch(LeafletRenderer);
export const geoSearchWithMapbox = geoSearch(MapboxRenderer);
