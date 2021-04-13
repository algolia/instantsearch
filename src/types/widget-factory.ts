import { WidgetRenderState } from './render-state';
import { Widget } from './widget';

/**
 * The function that creates a new widget.
 */
export type WidgetFactory<TRendererOptions, TConnectorParams, TWidgetParams> = (
  /**
   * The params of the widget.
   */
  widgetParams: TConnectorParams & TWidgetParams
) => Widget<{
  renderState: WidgetRenderState<
    TRendererOptions,
    // widgetParams sent to the connector of builtin widgets are actually
    // the connector params, therefore renderState uses TConnectorParams only
    TConnectorParams
  >;
}>;

export type UnknownWidgetFactory = WidgetFactory<any, any, any>;
