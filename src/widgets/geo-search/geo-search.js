import cx from 'classnames';
import noop from 'lodash/noop';
import { unmountComponentAtNode } from 'preact-compat';
import { getContainerNode, renderTemplate } from '../../lib/utils';
import { component } from '../../lib/suit';
import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import renderer from './GeoSearchRenderer';
import defaultTemplates from './defaultTemplates';
import createHTMLMarker from './createHTMLMarker';

const suit = component('GeoSearch');

const usage = `Usage:

geoSearch({
  container,
  googleReference,
  [ initialZoom = 1 ],
  [ initialPosition = { lat: 0, lng: 0 } ],
  [ paddingBoundingBox = { top: 0, right: 0, bottom: 0, right: 0 } ],
  [ cssClasses.{root,map,control,label,selectedLabel,input,redo,disabledRedo,reset} = {} ],
  [ templates.{reset,toggle,redo} ],
  [ mapOptions ],
  [ builtInMarker ],
  [ customHTMLMarker = false ],
  [ enableClearMapRefinement = true ],
  [ enableRefineControl = true ],
  [ enableRefineOnMapMove = true ],
  [ enableGeolocationWithIP = true ],
  [ position ],
  [ radius ],
  [ precision ],
})

Full documentation available at https://community.algolia.com/instantsearch.js/v2/widgets/geoSearch.html
`;

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
 * @property {function(item): MarkerOptions} [createOptions] Function used to create the options passed to the Google Maps marker. <br />
 * See [the documentation](https://developers.google.com/maps/documentation/javascript/reference/3/#MarkerOptions) for more information.
 * @property {{ eventType: function(object) }} [events] Object that takes an event type (ex: `click`, `mouseover`) as key and a listener as value. The listener is provided with an object that contains `event`, `item`, `marker`, `map`.
 */

/**
 * @typedef {object} GeoSearchCSSClasses
 * @property {string|Array<string>} [root] The root div of the widget.
 * @property {string|Array<string>} [map] The map container of the widget.
 * @property {string|Array<string>} [control] The control element of the widget.
 * @property {string|Array<string>} [label] The label of the control element.
 * @property {string|Array<string>} [selectedLabel] The selected label of the control element.
 * @property {string|Array<string>} [input] The input of the control element.
 * @property {string|Array<string>} [redo] The redo search button.
 * @property {string|Array<string>} [disabledRedo] The disabled redo search button.
 * @property {string|Array<string>} [reset] The reset refinement button.
 */

/**
 * @typedef {object} GeoSearchTemplates
 * @property {string|function(object): string} [reset] Template for the reset button.
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
 * @property {object} googleReference Reference to the global `window.google` object. <br />
 * See [the documentation](https://developers.google.com/maps/documentation/javascript/tutorial) for more information.
 * @property {number} [initialZoom=1] By default the map will set the zoom accordingly to the markers displayed on it. When we refine it may happen that the results are empty. For those situations we need to provide a zoom to render the map.
 * @property {LatLng} [initialPosition={ lat: 0, lng: 0 }] By default the map will set the position accordingly to the markers displayed on it. When we refine it may happen that the results are empty. For those situations we need to provide a position to render the map. This option is ignored when the `position` is provided.
 * @property {Padding} [paddingBoundingBox={ top:0, right: 0, bottom:0, left: 0 }] Add an inner padding on the map when you refine.
 * @property {GeoSearchTemplates} [templates] Templates to use for the widget.
 * @property {GeoSearchCSSClasses} [cssClasses] CSS classes to add to the wrapping elements.
 * @property {object} [mapOptions] Option forwarded to the Google Maps constructor. <br />
 * See [the documentation](https://developers.google.com/maps/documentation/javascript/reference/3/#MapOptions) for more information.
 * @property {BuiltInMarkerOptions} [builtInMarker] Options for customize the built-in Google Maps marker. This option is ignored when the `customHTMLMarker` is provided.
 * @property {CustomHTMLMarkerOptions|boolean} [customHTMLMarker=false] Options for customize the HTML marker. We provide an alternative to the built-in Google Maps marker in order to have a full control of the marker rendering. You can use plain HTML to build your marker.
 * @property {boolean} [enableClearMapRefinement=true] If true, a button is displayed on the map when the refinement is coming from the map in order to remove it.
 * @property {boolean} [enableRefineControl=true] If true, the user can toggle the option `enableRefineOnMapMove` directly from the map.
 * @property {boolean} [enableRefineOnMapMove=true] If true, refine will be triggered as you move the map.
 * @property {boolean} [enableGeolocationWithIP=true] If true, the IP will be use for the geolocation. If the `position` option is provided this option will be ignored, since we already refine the results around the given position. See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundLatLngViaIP) for more information.
 * @property {LatLng} [position] Position that will be use to search around. <br />
 * See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundLatLng) for more information.
 * @property {number} [radius] Maximum radius to search around the position (in meters). <br />
 * See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundRadius) for more information.
 * @property {number} [precision] Precision of geo search (in meters). <br />
 * See [the documentation](https://www.algolia.com/doc/api-reference/api-parameters/aroundPrecision) for more information.
 */

/**
 * The **GeoSearch** widget displays the list of results from the search on a Google Maps. It also provides a way to search for results based on their position. The widget also provide some of the common GeoSearch patterns like search on map interaction.
 *
 * @requirements
 *
 * Note that the GeoSearch widget uses the [geosearch](https://www.algolia.com/doc/guides/searching/geo-search) capabilities of Algolia. Your hits **must** have a `_geoloc` attribute in order to be displayed on the map.
 *
 * Currently, the feature is not compatible with multiple values in the _geoloc attribute.
 *
 * You are also responsible for loading the Google Maps library, it's not shipped with InstantSearch. You need to load the Google Maps library and pass a reference to the widget. You can find more information about how to install the library in [the Google Maps documentation](https://developers.google.com/maps/documentation/javascript/tutorial).
 *
 * Don't forget to explicitly set the `height` of the map container (default class `.ais-geo-search--map`), otherwise it won't be shown (it's a requirement of Google Maps).
 *
 * @type {WidgetFactory}
 * @devNovel GeoSearch
 * @param {GeoSearchWidgetOptions} $0 Options of the GeoSearch widget.
 * @return {Widget} A new instance of GeoSearch widget.
 * @staticExample
 * search.addWidget(
 *   instantsearch.widgets.geoSearch({
 *     container: '#geo-search-container',
 *     googleReference: window.google,
 *   })
 * );
 */
const geoSearch = ({
  initialZoom = 1,
  initialPosition = { lat: 0, lng: 0 },
  templates: userTemplates = {},
  cssClasses: userCssClasses = {},
  paddingBoundingBox: userPaddingBoundingBox = {},
  builtInMarker: userBuiltInMarker = {},
  customHTMLMarker: userCustomHTMLMarker = false,
  enableClearMapRefinement = true,
  enableRefineControl = true,
  container,
  googleReference,
  ...widgetParams
} = {}) => {
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
    throw new Error(`Must provide a "container". ${usage}`);
  }

  if (!googleReference) {
    throw new Error(`Must provide a "googleReference". ${usage}`);
  }

  const containerNode = getContainerNode(container);

  const cssClasses = {
    root: cx(suit(), userCssClasses.root),
    // Required only to mount / unmount the Preact tree
    tree: suit({ descendantName: 'tree' }),
    map: cx(suit({ descendantName: 'map' }), userCssClasses.map),
    control: cx(suit({ descendantName: 'control' }), userCssClasses.control),
    label: cx(suit({ descendantName: 'label' }), userCssClasses.label),
    selectedLabel: cx(
      suit({ descendantName: 'label', modifierName: 'selected' }),
      userCssClasses.selectedLabel
    ),
    input: cx(suit({ descendantName: 'input' }), userCssClasses.input),
    redo: cx(suit({ descendantName: 'redo' }), userCssClasses.redo),
    disabledRedo: cx(
      suit({ descendantName: 'redo', modifierName: 'disabled' }),
      userCssClasses.disabledRedo
    ),
    reset: cx(suit({ descendantName: 'reset' }), userCssClasses.reset),
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
      className: cx(suit({ descendantName: 'marker' })),
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
    const makeGeoSearch = connectGeoSearch(renderer, () => {
      unmountComponentAtNode(
        containerNode.querySelector(`.${cssClasses.tree}`)
      );

      while (containerNode.firstChild) {
        containerNode.removeChild(containerNode.firstChild);
      }
    });

    return makeGeoSearch({
      ...widgetParams,
      renderState: {},
      container: containerNode,
      googleReference,
      initialZoom,
      initialPosition,
      templates,
      cssClasses,
      paddingBoundingBox,
      createMarker,
      markerOptions,
      enableClearMapRefinement,
      enableRefineControl,
    });
  } catch (e) {
    throw new Error(`See usage. ${usage}`);
  }
};

export default geoSearch;
