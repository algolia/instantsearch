import cx from 'classnames';
import noop from 'lodash/noop';
import { bemHelper, renderTemplate } from '../../lib/utils';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import renderer from './GeoSearchRenderer';
import defaultTemplates from './defaultTemplates';
import createHTMLMarker from './createHTMLMarker';

const bem = bemHelper('ais-geo-search');

const geoSearch = (props = {}) => {
  const defaultBuiltInMarker = {
    createOptions: noop,
    events: {},
  };

  const defaultCustomHTMLMarker = {
    createOptions: noop,
    template: () => '<p>Your custom HTML Marker</p>',
    events: {},
  };

  const defaultPaddingBoundingBox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

  const widgetParams = {
    enableClearMapRefinement: true,
    enableRefineControl: true,
    cssClasses: {},
    templates: {},
    builtInMarker: {},
    customHTMLMarker: false,
    paddingBoundingBox: {},
    ...props,
  };

  const {
    cssClasses: userCssClasses,
    templates: userTemplates,
    builtInMarker: userBuiltInMarker,
    customHTMLMarker: userCustomHTMLMarker,
    paddingBoundingBox: userPaddingBoundingBox,
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
    ...userTemplates,
  };

  const builtInMarker = {
    ...defaultBuiltInMarker,
    ...userBuiltInMarker,
  };

  const customHTMLMarker = Boolean(userCustomHTMLMarker) && {
    ...defaultCustomHTMLMarker,
    ...userCustomHTMLMarker,
  };

  const paddingBoundingBox = {
    ...defaultPaddingBoundingBox,
    ...userPaddingBoundingBox,
  };

  const createBuiltInMarker = ({ item, ...rest }) =>
    new googleReference.maps.Marker({
      ...rest,
      ...builtInMarker.createOptions(item),
      __id: item.objectID,
      position: item._geoloc,
    });

  const HTMLMarker = createHTMLMarker(googleReference);
  const createCustomHTMLMarker = ({ item, ...rest }) =>
    new HTMLMarker({
      ...rest,
      ...customHTMLMarker.createOptions(item),
      __id: item.objectID,
      position: item._geoloc,
      className: cx(bem('marker')),
      template: renderTemplate({
        templateKey: 'template',
        templates: customHTMLMarker,
        data: item,
      }),
    });

  const createMarker = !customHTMLMarker
    ? createBuiltInMarker
    : createCustomHTMLMarker;

  // prettier-ignore
  const markerOptions = !customHTMLMarker
    ? builtInMarker
    : customHTMLMarker;

  try {
    const makeGeoSearch = connectGeoSearch(renderer);

    return makeGeoSearch({
      ...widgetParams,
      renderState: {},
      cssClasses,
      templates,
      paddingBoundingBox,
      createMarker,
      markerOptions,
    });
  } catch (e) {
    throw new Error(`See usage.`);
  }
};

export default geoSearch;
