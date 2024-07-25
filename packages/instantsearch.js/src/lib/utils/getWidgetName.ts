import type { Widget, IndexWidget } from '../../types';

export function getWidgetName(widget: Widget | IndexWidget): string {
  return widget.$$type;
}
