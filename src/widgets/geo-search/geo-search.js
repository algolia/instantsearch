import cx from 'classnames';
import { bemHelper } from '../../lib/utils.js';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import GoogleMapsRenderer from './GoogleMapsRenderer';

const bem = bemHelper('ais-geo');

const geoSearch = renderer => (props = {}) => {
  const widgetParams = {
    cssClasses: {},
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
