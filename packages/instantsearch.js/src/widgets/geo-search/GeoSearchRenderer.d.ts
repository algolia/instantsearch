/* global google */
import type {
  GeoSearchConnectorParams,
  GeoSearchRenderState,
} from '../../connectors';
import type { PreparedTemplateProps } from '../../lib/templating';
import type { ComponentCSSClasses, Renderer } from '../../types';
import type { HTMLMarkerArguments } from './createHTMLMarker';
import type {
  CreateMarker,
  GeoSearchMarker,
  GeoSearchTemplates,
  GeoSearchWidgetParams,
} from './geo-search';

// @TODO: decide whether this should use the "specialized renderer" pattern to separate these options from connector params
type GeoSearchRendererParams = {
  renderState: {
    templateProps?: PreparedTemplateProps<GeoSearchTemplates>;
    isUserInteraction?: boolean;
    isPendingRefine?: boolean;
    markers?: any[];
  };
  container: HTMLElement;
  googleReference: GeoSearchWidgetParams['googleReference'];
  initialZoom: GeoSearchWidgetParams['initialZoom'];
  initialPosition: GeoSearchWidgetParams['initialPosition'];
  templates: GeoSearchTemplates;
  cssClasses: ComponentCSSClasses<GeoSearchWidgetParams['cssClasses']>;
  createMarker: CreateMarker;
  markerOptions: GeoSearchMarker<
    google.maps.MarkerOptions | Partial<HTMLMarkerArguments>
  >;
  enableRefine: GeoSearchWidgetParams['enableRefine'];
  enableClearMapRefinement: GeoSearchWidgetParams['enableClearMapRefinement'];
  enableRefineControl: GeoSearchWidgetParams['enableRefineControl'];
};

declare const renderer: Renderer<
  GeoSearchRenderState,
  GeoSearchConnectorParams & GeoSearchRendererParams
>;
export default renderer;
