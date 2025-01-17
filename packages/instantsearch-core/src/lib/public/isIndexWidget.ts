import type { Widget, IndexWidget } from '../../types';

export function isIndexWidget(
  widget: Widget | IndexWidget
): widget is IndexWidget {
  return widget.$$type === 'ais.index';
}
