import type { Widget } from 'instantsearch.js';
import type { IndexWidget } from 'instantsearch.js/es/widgets/index/index';
import { getWidgetAttribute } from 'instantsearch.js/es/lib/utils';
import { createInitOptions } from '@instantsearch/mocks/createWidget';

function getAttribute(widget: Widget | IndexWidget) {
  try {
    return getWidgetAttribute(widget, createInitOptions());
  } catch {
    return undefined;
  }
}

/**
 * Jest serializer for an InstantSearch widget.
 *
 * It looks like this:
 *
 * Widget($$type)
 * Widget($$type) {
 *  $$widgetType: string
 *  attribute: string
 * }
 */
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
