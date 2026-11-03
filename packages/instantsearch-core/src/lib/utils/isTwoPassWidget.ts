import type { Widget, IndexWidget } from '../../types';

/**
 * Returns true if the widget requires a second SSR pass to discover and
 * mount child widgets (e.g. DynamicWidgets, Feeds).
 */
export function isTwoPassWidget(widget: Widget | IndexWidget): boolean {
  return (
    widget.$$type === 'ais.dynamicWidgets' || widget.$$type === 'ais.feeds'
  );
}
