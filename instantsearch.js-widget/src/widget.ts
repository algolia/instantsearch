import { connect } from './connector';
import { createRenderer } from './renderer';
import type {
  WidgetCreator,
  ConnectorParams,
  WidgetParams,
} from './types';

/*
 * Widget creator
 * Returns a widget instance
 */
export const : WidgetCreator = function (
  widgetParams
) {
  const rendererWidgetParams: WidgetParams = {
    container: widgetParams.container,
    // TODO: pick the widget-only parameters from the widgetParams
  };

  const { render, dispose } = createRenderer(
    rendererWidgetParams
  );

  const createWidget = connect(render, dispose);

  const connectorParams: ConnectorParams = {
    // TODO: pick the connector-only parameters from the widgetParams
  };

  return {
    ...createWidget(connectorParams),
    $$widgetType: '',
  };
};
