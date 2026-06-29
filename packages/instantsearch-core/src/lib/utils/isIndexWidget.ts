import { indexWidgetTypes } from '../../types';

import type { Widget, IndexWidget } from '../../types';

export function isIndexWidget(
  widget: Widget | IndexWidget
): widget is IndexWidget {
  return indexWidgetTypes.includes(widget.$$type as (typeof indexWidgetTypes)[number]);
}
