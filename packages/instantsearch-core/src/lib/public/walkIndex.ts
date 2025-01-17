import { isIndexWidget } from './isIndexWidget';

import type { IndexWidget } from '../../types';

/**
 * Recurse over all child indices
 */
export function walkIndex(
  indexWidget: IndexWidget,
  callback: (widget: IndexWidget) => void
) {
  callback(indexWidget);

  indexWidget.getWidgets().forEach((widget) => {
    if (isIndexWidget(widget)) {
      walkIndex(widget, callback);
    }
  });
}
