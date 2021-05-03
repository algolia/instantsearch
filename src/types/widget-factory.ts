import { Widget, WidgetDescription } from './widget';

/**
 * The function that creates a new widget.
 */
export type WidgetFactory<
  TWidgetDescription extends WidgetDescription,
  TConnectorParams,
  TWidgetParams
> = (
  /**
   * The params of the widget.
   */
  widgetParams: TWidgetParams & TConnectorParams
) => Widget<
  TWidgetDescription & {
    widgetParams: TConnectorParams;
  }
>;

export type UnknownWidgetFactory = WidgetFactory<{ $$type: string }, any, any>;
