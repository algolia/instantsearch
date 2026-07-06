import { isIndexWidget } from './isIndexWidget';
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

  if (Array.isArray(value) || t === 'object') {
    const type = Array.isArray(value) ? 'array' : 'object';
    try {
      return { value: JSON.stringify(value), type };
    } catch {
      return { type };
    }
  }

  if (t === 'function') {
    return { value: (value as Function).name, type: 'function' };
  }

  // symbols, DOM elements: name only
  return null;
}

/**
 * Turns a `widgetParams`-style record into the serialized `WidgetTreeParam[]`
 * shape used throughout the usage events. Shared between the widget tree and
 * the root `ais.instantSearch` node so every node reports params identically.
 */
export function serializeWidgetParams(
  widgetParams: Record<string, unknown>
): WidgetTreeParam[] {
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

  return params;
}

export function buildWidgetTree(
  widgets: Array<Widget | IndexWidget>,
  instantSearchInstance: InstantSearch,
  parent: IndexWidget = instantSearchInstance.mainIndex
): WidgetTreeNode[] {
  const initOptions = createInitArgs(
    instantSearchInstance,
    parent,
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

    const params = serializeWidgetParams(widgetParams);

    const children = isIndexWidget(widget)
      ? buildWidgetTree(widget.getWidgets(), instantSearchInstance, widget)
      : [];

    return {
      type: widget.$$widgetType || widget.$$type || 'unknown',
      params,
      children,
    };
  });
}
