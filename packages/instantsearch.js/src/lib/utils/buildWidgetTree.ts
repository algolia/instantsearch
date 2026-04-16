import { createInitArgs } from './render-args';

import type { InstantSearch, Widget, IndexWidget } from '../../types';

export type TelemetryWidgetParam = {
  name: string;
  value?: string;
  type?: string;
};

export type TelemetryWidgetNode = {
  type: string;
  params: TelemetryWidgetParam[];
  children: TelemetryWidgetNode[];
};

function serializeParamValue(
  value: unknown
): Pick<TelemetryWidgetParam, 'value' | 'type'> | null {
  if (value === undefined || value === null) {
    return null;
  }

  const t = typeof value;

  if (t === 'string' || t === 'number' || t === 'boolean') {
    return { value: String(value), type: t };
  }

  if (Array.isArray(value)) {
    try {
      return { value: JSON.stringify(value), type: 'array' };
    } catch {
      return { type: 'array' };
    }
  }

  if (t === 'object') {
    try {
      return { value: JSON.stringify(value), type: 'object' };
    } catch {
      return { type: 'object' };
    }
  }

  // functions, symbols, DOM elements — name only
  return null;
}

export function buildWidgetTree(
  widgets: Array<Widget | IndexWidget>,
  instantSearchInstance: InstantSearch
): TelemetryWidgetNode[] {
  const initOptions = createInitArgs(
    instantSearchInstance,
    instantSearchInstance.mainIndex,
    instantSearchInstance._initialUiState
  );

  return widgets.map((widget) => {
    let widgetParams: Record<string, unknown> = {};

    if (widget.getWidgetRenderState) {
      const renderState = widget.getWidgetRenderState(initOptions);
      if (renderState && renderState.widgetParams) {
        widgetParams = renderState.widgetParams as Record<string, unknown>;
      }
    }

    const params: TelemetryWidgetParam[] = [];

    Object.keys(widgetParams).forEach((key) => {
      const raw = widgetParams[key];
      if (raw === undefined) {
        return;
      }
      const serialized = serializeParamValue(raw);
      if (serialized) {
        params.push({ name: key, ...serialized });
      } else {
        params.push({ name: key });
      }
    });

    const children =
      widget.$$type === 'ais.index'
        ? buildWidgetTree(
            (widget as IndexWidget).getWidgets(),
            instantSearchInstance
          )
        : [];

    return {
      type: widget.$$widgetType || widget.$$type || 'unknown',
      params,
      children,
    };
  });
}
