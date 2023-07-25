import { defer } from './utils';

import type { ConnectorDescription } from './createConnector';
import type { Component } from 'react';

export type Widget = Component & {
  constructor: {
    displayName?: string;
    $$type?: string;
    $$widgetType?: string;
    _connectorDesc?: ConnectorDescription;
  };
};

export type WidgetsManager = ReturnType<typeof createWidgetsManager>;

export default function createWidgetsManager(onWidgetsUpdate: () => void) {
  const widgets: Widget[] = [];
  // Is an update scheduled?
  let scheduled = false;

  // The state manager's updates need to be batched since more than one
  // component can register or unregister widgets during the same tick.
  function scheduleUpdate() {
    if (scheduled) {
      return;
    }
    scheduled = true;
    defer(() => {
      scheduled = false;
      onWidgetsUpdate();
    });
  }

  return {
    registerWidget(widget: Widget) {
      widgets.push(widget);
      scheduleUpdate();
      return function unregisterWidget() {
        widgets.splice(widgets.indexOf(widget), 1);
        scheduleUpdate();
      };
    },
    update: scheduleUpdate,
    getWidgets() {
      return widgets;
    },
  };
}
