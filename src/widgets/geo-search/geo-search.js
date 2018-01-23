import cx from 'classnames';
import noop from 'lodash/noop';
import { bemHelper } from '../../lib/utils';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import renderer from './GeoSearchRenderer';
import defaultTemplates from './defaultTemplates';

const bem = bemHelper('ais-geo-search');

const geoSearch = (props = {}) => {
  const widgetParams = {
    enableClearMapRefinement: true,
    enableRefineControl: true,
    cssClasses: {},
    templates: {},
    paddingBoundingBox: {
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
    },
    createMarkerOptions: noop,
    ...props,
  };

  const {
    cssClasses: userCssClasses,
    container,
    googleReference,
  } = widgetParams;

  if (!container) {
    throw new Error(`Must provide a container.`);
  }

  if (!googleReference) {
    throw new Error(`Must provide a google reference.`);
  }

  const cssClasses = {
    root: cx(bem(null), userCssClasses.root),
    map: cx(bem('map'), userCssClasses.map),
    controls: cx(bem('controls'), userCssClasses.controls),
    clear: cx(bem('clear'), userCssClasses.clear),
    control: cx(bem('control'), userCssClasses.control),
    toggleLabel: cx(bem('toggle-label'), userCssClasses.toggleLabel),
    toggleLabelActive: cx(
      bem('toggle-label-active'),
      userCssClasses.toggleLabelActive
    ),
    toggleInput: cx(bem('toggle-input'), userCssClasses.toggleInput),
    redo: cx(bem('redo'), userCssClasses.redo),
  };

  const templates = {
    ...defaultTemplates,
    ...widgetParams.templates,
  };

  try {
    const makeGeoSearch = connectGeoSearch(renderer);

    return makeGeoSearch({
      ...widgetParams,
      renderState: {},
      cssClasses,
      templates,
    });
  } catch (e) {
    throw new Error(`See usage.`);
  }
};

export default geoSearch;
