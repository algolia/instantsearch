import type { Widget } from '../../types';
import type { IndexWidget } from '../../widgets/index/index';

export function getWidgetAttribute(widget: Widget | IndexWidget): string {
  try {
    // assume the type to be the correct one, but throw a nice error if it isn't the case
    type WidgetWithAttribute = Widget<{
      $$type: string;
      renderState: Record<string, unknown>;
      indexRenderState: Record<string, unknown>;
      widgetParams: { attribute: string } | { attributes: string[] };
    }>;

    const { widgetParams } = (
      widget as WidgetWithAttribute
    ).getWidgetRenderState({});

    const attribute =
      'attribute' in widgetParams
        ? widgetParams.attribute
        : widgetParams.attributes[0];

    if (typeof attribute !== 'string') throw new Error();

    return attribute;
  } catch (e) {
    console.log(widget.getWidgetRenderState!({}));
    throw new Error(
      `Could not find the attribute of the widget:

${JSON.stringify(widget)}

Please check whether the widget's getWidgetRenderState returns widgetParams.attribute correctly.`
    );
  }
}
