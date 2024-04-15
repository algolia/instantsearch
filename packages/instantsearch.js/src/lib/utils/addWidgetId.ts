import type { Widget } from '../../types';

let id = 0;

export function addWidgetId(widget: Widget) {
  if (widget.dependsOn !== 'recommend') {
    return;
  }

  widget.$$id = id++;
}
