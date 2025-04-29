// global for TypeScript alone
/* global google */
import { cx } from 'instantsearch-ui-components';
import { render } from 'preact';

import connectGeoSearch from '../../connectors/geo-search/connectGeoSearch';
import { component } from '../../lib/suit';
import { renderTemplate } from '../../lib/templating';
import {
  getContainerNode,
  createDocumentationMessageGenerator,
} from '../../lib/utils';

import createHTMLMarker from './createHTMLMarker';
import defaultTemplates from './defaultTemplates';
import renderer from './GeoSearchRenderer';

import type {
  GeoSearchConnectorParams,
  GeoSearchWidgetDescription,
  GeoHit,
} from '../../connectors/geo-search/connectGeoSearch';
import type { GeoLoc, Template, WidgetFactory } from '../../types';
import type { HTMLMarkerArguments } from './createHTMLMarker';

export type CreateMarker = (args: {
  item: GeoHit;
  map: google.maps.Map;
}) => google.maps.OverlayView | google.maps.Marker;

const withUsage = createDocumentationMessageGenerator({ name: 'geo-search' });
const suit = component('GeoSearch');

export type GeoSearchTemplates<THit extends GeoHit = GeoHit> = Partial<{
  /** Template to use for the marker. */
  HTMLMarker: Template<THit>;
  /** Template for the reset button. */
  reset: Template;
  /** Template for the toggle label. */
  toggle: Template;
  /** Template for the redo button. */
  redo: Template;
}>;

export type GeoSearchComponentTemplates = Required<GeoSearchTemplates>;

export type GeoSearchCSSClasses = Partial<{
  /** The root div of the widget. */
  root: string | string[];
  /** The map container of the widget. */
  map: string | string[];
  /** The control element of the widget. */
  control: string | string[];
  /** The label of the control element. */
  label: string | string[];
  /** The selected label of the control element. */
  selectedLabel: string | string[];
  /** The input of the control element. */
  input: string | string[];
  /** The redo search button. */
  redo: string | string[];
  /** The disabled redo search button. */
  disabledRedo: string | string[];
  /** The reset refinement button. */
  reset: string | string[];
}>;

export type GeoSearchMarker<TOptions, THit extends GeoHit = GeoHit> = {
  /**
   * Function used to create the options passed to the Google Maps marker.
   * See the documentation for more information:
   * https://developers.google.com/maps/documentation/javascript/reference/3/#MarkerOptions
   */
  createOptions?: (item: THit) => TOptions;
  /**
   * Object that takes an event type (ex: `click`, `mouseover`) as key and a
   * listener as value. The listener is provided with an object that contains:
   * `event`, `item`, `marker`, `map`.
   */
  events: {
    [key: string]: (event: {
      item: any;
      marker: any;
      map: any;
      event: any;
    }) => void;
  };
};

export type GeoSearchWidgetParams<THit extends GeoHit = GeoHit> = {
  /**
   * By default the map will set the zoom accordingly to the markers displayed on it.
   * When we refine it may happen that the results are empty. For those situations we
   * need to provide a zoom to render the map.
   * @default 1
   */
  initialZoom?: number;
  /**
   * By default the map will set the position accordingly to the markers displayed on it.
   * When we refine it may happen that the results are empty. For those situations we need
   * to provide a position to render the map. This option is ignored when the `position`
   * is provided.
   * @default { lat: 0, lng: 0 }
   */
  initialPosition?: GeoLoc;
  /** Templates to use for the widget. */
  templates?: GeoSearchTemplates<THit>;
  /** CSS classes to add to the wrapping elements. */
  cssClasses?: GeoSearchCSSClasses;
  /**
   * Options for customize the built-in Google Maps marker. This option is
   * ignored when the `customHTMLMarker` is provided.
   */
  builtInMarker?: Partial<GeoSearchMarker<google.maps.MarkerOptions>>;
  /**
   * Options to customize the HTML marker. We provide an alternative to the
   * built-in Google Maps marker in order to have a full control of the marker
   * rendering. You can use plain HTML to build your marker.
   */
  customHTMLMarker?:
    | Partial<GeoSearchMarker<Partial<HTMLMarkerArguments>>>
    | boolean;
  /**
   * If true, the map is used to search - otherwise it's for display purposes only.
   * @default true
   */
  enableRefine?: boolean;
  /**
   * If true, a button is displayed on the map when the refinement is coming from
   * the map in order to remove it.
   * @default true
   */
  enableClearMapRefinement?: boolean;
  /**
   * If true, the user can toggle the option `enableRefineOnMapMove` directly from the map.
   * @default true
   */
  enableRefineControl?: boolean;
  /**
   * Option forwarded to the Google Maps constructor.
   * See the documentation for more information:
   * https://developers.google.com/maps/documentation/javascript/reference/3/#MapOptions
   */
  mapOptions?: google.maps.MapOptions;
  /**
   * CSS Selector or HTMLElement to insert the widget.
   */
  container: string | HTMLElement;
  /**
   * Reference to the global `window.google` object.
   * See [the documentation](https://developers.google.com/maps/documentation/javascript/tutorial) for more information.
   */
  googleReference: typeof window['google'];
};

export type GeoSearchWidget = WidgetFactory<
  GeoSearchWidgetDescription & { $$widgetType: 'ais.geoSearch' },
  GeoSearchConnectorParams,
  GeoSearchWidgetParams
>;

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
 */
export default (function geoSearch<THit extends GeoHit = GeoHit>(
  widgetParams: GeoSearchWidgetParams<THit> & GeoSearchConnectorParams<THit>
) {
  const {
    initialZoom = 1,
    initialPosition = { lat: 0, lng: 0 },
    templates: userTemplates = {},
    cssClasses: userCssClasses = {},
    builtInMarker: userBuiltInMarker = {},
    customHTMLMarker: userCustomHTMLMarker,
    enableRefine = true,
    enableClearMapRefinement = true,
    enableRefineControl = true,
    container,
    googleReference,
    ...otherWidgetParams
  } = widgetParams || {};

  const defaultBuiltInMarker: GeoSearchMarker<google.maps.MarkerOptions> = {
    createOptions: () => ({}),
    events: {},
  };

  const defaultCustomHTMLMarker: GeoSearchMarker<Partial<HTMLMarkerArguments>> =
    {
      createOptions: () => ({}),
      events: {},
    };

  if (!container) {
    throw new Error(withUsage('The `container` option is required.'));
  }

  if (!googleReference) {
    throw new Error(withUsage('The `googleReference` option is required.'));
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

  const templates: GeoSearchTemplates<THit> = {
    ...defaultTemplates,
    ...userTemplates,
  };

  const builtInMarker = {
    ...defaultBuiltInMarker,
    ...userBuiltInMarker,
  };

  const isCustomHTMLMarker =
    Boolean(userCustomHTMLMarker) || Boolean(userTemplates.HTMLMarker);

  const customHTMLMarker = isCustomHTMLMarker && {
    ...defaultCustomHTMLMarker,
    ...(userCustomHTMLMarker as Partial<
      GeoSearchMarker<Partial<HTMLMarkerArguments>>
    >),
  };

  const createBuiltInMarker: CreateMarker = ({ item, ...rest }) =>
    new googleReference.maps.Marker({
      ...builtInMarker.createOptions!(item),
      ...rest,
      // @ts-expect-error @types/googlemaps doesn't document this
      __id: item.objectID,
      position: item._geoloc,
    });

  const HTMLMarker = createHTMLMarker(googleReference);
  const createCustomHTMLMarker: CreateMarker = ({ item, ...rest }) =>
    new HTMLMarker({
      // this is only called when customHTMLMarker is defined
      ...(customHTMLMarker as GeoSearchMarker<Partial<HTMLMarkerArguments>>)
        .createOptions!(item),
      ...rest,
      __id: item.objectID,
      position: item._geoloc,
      className: cx(suit({ descendantName: 'marker' })),
      template: renderTemplate({
        templateKey: 'HTMLMarker',
        templates,
        data: item,
      }),
    });

  const createMarker = !customHTMLMarker
    ? createBuiltInMarker
    : createCustomHTMLMarker;

  const markerOptions = !customHTMLMarker ? builtInMarker : customHTMLMarker;

  const makeWidget = connectGeoSearch(renderer, () =>
    render(null, containerNode)
  );

  return {
    ...makeWidget<THit>({
      ...otherWidgetParams,
      // @TODO: this type doesn't preserve the generic correctly,
      // (but as they're internal only it's not a big problem)
      templates: templates as any,
      renderState: {},
      container: containerNode,
      googleReference,
      initialZoom,
      initialPosition,
      cssClasses,
      createMarker,
      markerOptions,
      enableRefine,
      enableClearMapRefinement,
      enableRefineControl,
    }),
    $$widgetType: 'ais.geoSearch',
  };
} satisfies GeoSearchWidget);
