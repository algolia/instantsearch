import type { InitOptions, Widget, IndexWidget } from '../../types';

export function getWidgetAttribute(
  widget: Widget | IndexWidget,
  initOptions: InitOptions
): string {
  const renderState = widget.getWidgetRenderState?.(initOptions);

  let attribute = null;

  if (renderState && renderState.widgetParams) {
    // casting as widgetParams is checked just before
    const widgetParams = renderState.widgetParams as Record<string, unknown>;

    if (widgetParams.attribute) {
      attribute = widgetParams.attribute;
    } else if (Array.isArray(widgetParams.attributes)) {
      attribute = widgetParams.attributes[0];
    }
  }

  if (typeof attribute !== 'string') {
    throw new Error(`Could not find the attribute of the widget:

${JSON.stringify(widget)}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`);
  }

  return attribute;
}
