import React, { render } from 'preact-compat';
import cx from 'classnames';
import { bemHelper, getContainerNode } from '../../lib/utils.js';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import GoogleMapProvider from '../../components/GeoSearch/GoogleMapsProvider';

const bem = bemHelper('ais-geo');

const renderer = ({
  hits,
  refine,
  clearRefinementWithMap,
  isRefinedWithMap,
  enableRefineOnMapMove,
  widgetParams,
}) => {
  const { container } = widgetParams;

  const loadingElementStyle = {
    height: '100%',
  };

  const mapElementStyle = {
    height: '350px',
    marginTop: '10px',
    marginBottom: '10px',
  };

  render(
    <GoogleMapProvider
      googleMapURL="https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places"
      loadingElement={<div style={loadingElementStyle} />}
      containerElement={<div />}
      mapElement={<div style={mapElementStyle} />}
      markers={hits}
      refine={refine}
      clearRefinementWithMap={clearRefinementWithMap}
      isRefinedWithMap={isRefinedWithMap}
      enableRefineOnMapMove={enableRefineOnMapMove}
    />,
    getContainerNode(container)
  );
};

export default function geoSearch(props = {}) {
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
}
