import { createInitArgs } from './render-args';

import type { InstantSearch, Widget, IndexWidget } from '../../types';

export type WidgetTreeParam = {
  name: string;
  value?: string;
  type?: string;
};

export type WidgetTreeNode = {
  type: string;
  params: WidgetTreeParam[];
  children: WidgetTreeNode[];
};

function serializeParamValue(
  value: unknown
): Pick<WidgetTreeParam, 'value' | 'type'> | null {
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
): WidgetTreeNode[] {
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

    const params: WidgetTreeParam[] = [];

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
