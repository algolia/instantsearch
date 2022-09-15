import type { Widget } from '../../types';
import type { IndexWidget } from '../../widgets/index/index';

export function isIndexWidget(
  widget: Widget | IndexWidget
): widget is IndexWidget {
  return widget.$$type === 'ais.index';
}
