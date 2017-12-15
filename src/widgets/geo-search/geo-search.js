import cx from 'classnames';
import { bemHelper } from '../../lib/utils';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';

const bem = bemHelper('ais-geo');

const renderer = (
  {
    // items,
    // refine,
    // clearMapRefinement,
    // toggleRefineOnMapMove,
    // isRefineOnMapMove,
    // setMapMoveSinceLastRefine,
    // hasMapMoveSinceLastRefine,
    // isRefinedWithMap,
    widgetParams,
    ...rest
  },
  isFirstRendering
) => {
  const {
    container,
    googleMapsInstance,
    // cssClasses,
    // initialZoom,
    // initialPosition,
    // enableRefineControl,
    // paddingBoundingBox,
    // renderState,
  } = widgetParams;
  console.log('isFirstRendering', isFirstRendering);
  console.log(googleMapsInstance);
  console.log(container);
  console.log(rest);
};

const geoSearch = (props = {}) => {
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

export default geoSearch;
