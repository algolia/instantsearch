import cx from 'classnames';
import { bemHelper } from '../../lib/utils.js';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import GoogleMapsRenderer from './GoogleMapsRenderer';
import LeafletRenderer from './LeafletRenderer';
import MapboxRenderer from './MapboxRenderer';

const bem = bemHelper('ais-geo');

// type LatLng = Array<number, number>;
//
// type Bounds = {
//   northEast: LatLng,
//   southWest: LatLng,
// };
//
// type Position = {
//   top: number,
//   right: number,
//   bottom: number,
//   left: number,
// };
//
// type WidgetOptions = {
//   enableGeolocationWithIP: boolean,
//   enableRefineOnMapMove: boolean,
//   enableRefineControl: boolean,
//   position?: string, // 40.71, -74.01
//   radius?: number | 'all',
//   minRadius?: number,
//   precision?: number,
//   paddingBoundingBox?: Position,
// };
//
// type RenderingOptions = {
//   hits: Array<{ _geoloc: { lat: number, lng: number } }>,
//   refine: (bounds: Bounds) => void,
//   clearMapRefinement: () => void,
//   toggleRefineOnMapMove: () => void,
//   setMapMoveSinceLastRefine: () => void,
//   isRefinedWithMap: boolean,
//   enableRefineOnMapMove: boolean,
//   hasMapMoveSinceLastRefine: boolean,
//   widgetParams: WidgetOptions,
// };

const geoSearch = renderer => (props = {}) => {
  const widgetParams = {
    cssClasses: {},
    enableRefineControl: true,
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
