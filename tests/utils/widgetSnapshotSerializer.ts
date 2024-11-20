import { isIndexWidget, getWidgetAttribute } from 'instantsearch-core';
import { createInitOptions } from 'instantsearch-core/test/createWidget';

import type { InitOptions, Widget, IndexWidget } from 'instantsearch-core';

function getAttribute(widget: Widget | IndexWidget) {
  try {
    // casted to harmonize between src and es types of the same
    return getWidgetAttribute(
      widget,
      createInitOptions() as unknown as InitOptions
    );
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
      indexId: isIndexWidget(widget) && widget.getIndexId(),
      widgets:
        isIndexWidget(widget) &&
        `[\n${indentation + indent + indent}${widget
          .getWidgets()
          .map((w) =>
            (this as any).serialize(
              w,
              { indent },
              indentation + indent + indent
            )
          )
          .join(`\n${indentation + indent + indent}`)}\n${
          indentation + indent
        }]`,
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
