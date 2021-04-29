/* global google EventListener */

import {
  GeoSearchConnectorParams,
  GeoSearchWidgetDescription,
  GeoHit,
} from '../../connectors/geo-search/types';
import { GeoLoc, Template, WidgetFactory } from '../../types';
import { HTMLMarkerArguments } from './createHTMLMarker';

export type GeoSearchTemplates = {
  HTMLMarker: Template<GeoHit>;
  reset: Template;
  toggle: Template;
  redo: Template;
};

export type GeoSearchCSSClasses = {
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
};

export type GeoSearchMarker<TOptions> = {
  createOptions?(item: GeoHit): TOptions;
  events: {
    [key: string]: EventListener;
  };
};

export type GeoSearchWidgetParams = {
  initialZoom?: number;
  initialPosition?: GeoLoc;
  templates?: Partial<GeoSearchTemplates>;
  cssClasses?: Partial<GeoSearchCSSClasses>;
  builtInMarker?: GeoSearchMarker<google.maps.MarkerOptions>;
  customHTMLMarker?: GeoSearchMarker<HTMLMarkerArguments>;
  enableRefine?: boolean;
  enableClearMapRefinement?: boolean;
  enableRefineControl?: boolean;
  container: string | HTMLElement;
  googleReference: typeof google;
};

export type GeoSearchWidget = WidgetFactory<
  GeoSearchWidgetDescription & { $$widgetType: 'ais.geoSearch' },
  GeoSearchConnectorParams,
  GeoSearchWidgetParams
>;
