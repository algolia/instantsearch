import cx from 'classnames';
import noop from 'lodash/noop';
import { bemHelper, renderTemplate } from '../../lib/utils';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import renderer from './GeoSearchRenderer';
import defaultTemplates from './defaultTemplates';
import createHTMLMarker from './createHTMLMarker';

const bem = bemHelper('ais-geo-search');

/**
 * @typedef {object} HTMLMarkerOptions
 * @property {object} [anchor] The offset from the marker's position.
 */

/**
 * @typedef {object} CustomHTMLMarkerOptions
 * @property {string|function(item): string} template Template to use for the marker.
 * @property {function(item): HTMLMarkerOptions} [createOptions] Function used to create the options passed to the HTMLMarker.
 * @property {{ eventType: function(object) }} [events] Object that takes an event type (ex: `click`, `mouseover`) as key and a listener as value. The listener is provided with an object that contains `event`, `item`, `marker`, `map`.
 */

/**
 * @typedef {object} BuiltInMarkerOptions
 * @property {function(item): MarkerOptions} [createOptions] Function used to create the options passed to the Google Maps marker. You can find more information in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/reference/3/#MarkerOptions).
 * @property {{ eventType: function(object) }} [events] Object that takes an event type (ex: `click`, `mouseover`) as key and a listener as value. The listener is provided with an object that contains `event`, `item`, `marker`, `map`.
 */

/**
 * @typedef {object} GeoSeachCSSClasses
 * @property {string|Array<string>} [root] CSS class to add to the root element.
 * @property {string|Array<string>} [map] CSS class to add to the map element.
 * @property {string|Array<string>} [controls] CSS class to add to the controls element.
 * @property {string|Array<string>} [clear] CSS class to add to the clear element.
 * @property {string|Array<string>} [control] CSS class to add to the control element.
 * @property {string|Array<string>} [toggleLabel] CSS class to add to the toggle label.
 * @property {string|Array<string>} [toggleLabelActive] CSS class to add to toggle label when it's active.
 * @property {string|Array<string>} [toggleInput] CSS class to add to the toggle input.
 * @property {string|Array<string>} [redo] CSS class to add to the redo element.
 */

/**
 * @typedef {object} GeoSearchTemplates
 * @property {string|function(object): string} [clear] Template for the clear button.
 * @property {string|function(object): string} [toggle] Template for the toggle label.
 * @property {string|function(object): string} [redo] Template for the redo button.
 */

/**
 * @typedef {object} Padding
 * @property {number} top The top padding in pixels.
 * @property {number} right The right padding in pixels.
 * @property {number} bottom The bottom padding in pixels.
 * @property {number} left The left padding in pixels.
 */

/**
 * @typedef {object} LatLng
 * @property {number} lat The latitude in degrees.
 * @property {number} lng The longitude in degrees.
 */

/**
 * @typedef {object} GeoSearchWidgetOptions
 * @property {string|HTMLElement} container CSS Selector or HTMLElement to insert the widget.
 * @property {object} googleReference Reference to the global `window.google` object. You can find more information about how to load the library in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/tutorial).
 * @property {number} [initialZoom=1] By default the map will set the zoom accordingly to the markers displayed on it. When we refine it may happen that the results are empty. For those situtations we need to provide a zoom to render the map.
 * @property {LatLng} [initialPosition={ lat: 0, lng: 0 }] By default the map will set the position accordingly to the markers displayed on it. When we refine it may happen that the results are empty. For those situtations we need to provide a position to render the map. This option is ignored when the `position` is provided.
 * @property {Padding} [paddingBoundingBox={ top:0, right: 0, bottom:0, left: 0 }] Add an inner padding on the map when you refine.
 * @property {GeoSearchTemplates} [templates] Templates to use for the widget.
 * @property {GeoSeachCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {object} [mapOptions] Option forwarded to the Google Maps constructor. You can find more information in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/reference/3/#MapOptions).
 * @property {BuiltInMarkerOptions} [builtInMarker] Options for customize the built-in Google Maps marker. This option is ignored when the `customHTMLMarker` is provided.
 * @property {CustomHTMLMarkerOptions|boolean} [customHTMLMarker=false] Options for customize the HTML marker. We provide an alternative to the built-in Google Maps marker in order to have a full control of the marker rendering. You can use plain HTML to build your marker.
 * @property {boolean} [enableClearMapRefinement=true] If true, a button is displayed on the map when the refinement is coming from the map in order to remove it.
 * @property {boolean} [enableRefineControl=true] If true, the user can toggle the option `enableRefineOnMapMove` directly from the map.
 * @property {boolean} [enableRefineOnMapMove=true] If true, refine will be triggered as you move the map.
 * @property {boolean} [enableGeolocationWithIP=true] If true, the IP will be use for the geolocation. If the `position` option is provided this option will be ignored, since we already refine the results around the given position. See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundLatLngViaIP) for more informations.
 * @property {LatLng} [position] Position that will be use to search around. <br />
 * See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundLatLng) for more informations.
 * @property {number} [radius] Maximum radius to search around the position (in meters). <br />
 * See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundRadius) for more informations.
 * @property {number} [precision] Precision of geo search (in meters). <br />
 * See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundPrecision) for more informations.
 */

/**
 * **GeoSearch** wdiget displays the list of results from the search on a Google Maps. It also provides a way to search for results based on their position. The widget also provide some of the common GeoSearch patterns like search on map interaction.
 *
 * @requirements
 *
 * Note that the GeoSearch widget takes leverage of the [geosearch](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be displayed on the map.
 *
 * You are also repsonsible for loading the Google Maps library, it's not shipped with InstantSearch. You need to load the Google Maps library and pass a reference to the widget. You can find more information about how to install the library in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/tutorial).
 *
 * @type {WidgetFactory}
 * @param {GeoSearchWidgetOptions} $0 Options of the GeoSearch widget.
 * @return {Widget} A new instance of GeoSearch widget.
 * @example
 * search.addWidget(
 *   instantsearch.widgets.geoSearch({
 *     container: '#geo-search-container',
 *     googleReference: window.google,
 *   })
 * );
 */
const geoSearch = (
  {
    enableClearMapRefinement = true,
    enableRefineControl = true,
    cssClasses: userCssClasses = {},
    templates: userTemplates = {},
    builtInMarker: userBuiltInMarker = {},
    customHTMLMarker: userCustomHTMLMarker = false,
    paddingBoundingBox: userPaddingBoundingBox = {},
    initialZoom = 1,
    initialPosition = {
      lat: 0,
      lng: 0,
    },
    container,
    googleReference,
    ...widgetParams
  } = {}
) => {
  const defaultBuiltInMarker = {
    createOptions: noop,
    events: {},
  };

  const defaultCustomHTMLMarker = {
    template: '<p>Your custom HTML Marker</p>',
    createOptions: noop,
    events: {},
  };

  const defaultPaddingBoundingBox = {
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
  };

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
      ...builtInMarker.createOptions(item),
      ...rest,
      __id: item.objectID,
      position: item._geoloc,
    });

  const HTMLMarker = createHTMLMarker(googleReference);
  const createCustomHTMLMarker = ({ item, ...rest }) =>
    new HTMLMarker({
      ...customHTMLMarker.createOptions(item),
      ...rest,
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
      container,
      googleReference,
      initialZoom,
      initialPosition,
      enableClearMapRefinement,
      enableRefineControl,
      cssClasses,
      templates,
      createMarker,
      markerOptions,
      paddingBoundingBox,
    });
  } catch (e) {
    throw new Error(`See usage.`);
  }
};

export default geoSearch;
