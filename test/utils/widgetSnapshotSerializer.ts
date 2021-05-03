import { Widget } from '../../src/types';
import { IndexWidget } from '../../src/widgets/index/index';
import { getWidgetAttribute } from '../../src/lib/utils';
import { createInitOptions } from '../mock/createWidget';

function getAttribute(widget) {
  try {
    return getWidgetAttribute(widget, createInitOptions());
  } catch {
    return undefined;
  }
}

export const widgetSnapshotSerializer: jest.SnapshotSerializerPlugin = {
  serialize(widget: Widget | IndexWidget, { indent }, indentation) {
    const keys = {
      $$widgetType: widget.$$widgetType,
      attribute: getAttribute(widget),
    };

    const widgetName = `Widget(${widget.$$type || 'unknown'})`;

    const content = Object.entries(keys)
      .filter(([_key, value]) => value)
      .map(([key, value]) => `${indentation}${indent}${key}: ${value}`)
      .join('\n');

    if (content) {
      return `${widgetName} {
${content}
${indentation}}`;
    }

    return widgetName;
  },
  test(value) {
    return Boolean(value?.$$type);
  },
};
