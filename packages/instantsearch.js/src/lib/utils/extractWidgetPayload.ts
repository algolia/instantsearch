import { createInitArgs } from './render-args';

import type { InstantSearch, Widget, IndexWidget } from '../../types';

export type WidgetMetadata =
  | {
      type: string | undefined;
      widgetType: string | undefined;
      params: string[];
    }
  | {
      type: string;
      middleware: true;
      internal: boolean;
    };

export function extractWidgetPayload(
  widgets: Array<Widget | IndexWidget>,
  instantSearchInstance: InstantSearch,
  payload: { widgets: WidgetMetadata[] }
) {
  const initOptions = createInitArgs(
    instantSearchInstance,
    instantSearchInstance.mainIndex,
    instantSearchInstance._initialUiState
  );

  widgets.forEach((widget) => {
    let widgetParams: Record<string, unknown> = {};

    if (widget.getWidgetRenderState) {
      const renderState = widget.getWidgetRenderState(initOptions);

      if (renderState && renderState.widgetParams) {
        // casting, as we just earlier checked widgetParams exists, and thus an object
        widgetParams = renderState.widgetParams as Record<string, unknown>;
      }
    }

    // since we destructure in all widgets, the parameters with defaults are set to "undefined"
    const params = Object.keys(widgetParams).filter(
      (key) => widgetParams[key] !== undefined
    );

    payload.widgets.push({
      type: widget.$$type,
      widgetType: widget.$$widgetType,
      params,
    });

    if (widget.$$type === 'ais.index') {
      extractWidgetPayload(
        (widget as IndexWidget).getWidgets(),
        instantSearchInstance,
        payload
      );
    }
  });
}
