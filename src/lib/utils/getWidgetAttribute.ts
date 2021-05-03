import { InitOptions, Widget } from '../../types';
import { IndexWidget } from '../../widgets/index/index';

export function getWidgetAttribute(
  widget: Widget | IndexWidget,
  initOptions: InitOptions
): string {
  try {
    // assume the type to be the correct one, but throw a nice error if it isn't the case
    type WidgetWithAttribute = Widget<{
      $$type: string;
      renderState: Record<string, unknown>;
      indexRenderState: Record<string, unknown>;
      widgetParams: { attribute: string } | { attributes: string[] };
    }>;

    const {
      widgetParams,
    } = (widget as WidgetWithAttribute).getWidgetRenderState(initOptions);

    const attribute =
      'attribute' in widgetParams
        ? widgetParams.attribute
        : widgetParams.attributes[0];

    if (typeof attribute !== 'string') throw new Error();

    return attribute;
  } catch (e) {
    throw new Error(
      `Could not find the attribute of the widget:

${JSON.stringify(widget)}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`
    );
  }
}
