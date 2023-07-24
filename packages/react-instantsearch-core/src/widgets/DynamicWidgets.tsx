import React, { Fragment } from 'react';

import connectDynamicWidgets from '../connectors/connectDynamicWidgets';
import { getDisplayName } from '../core/utils';

import type { ComponentType, ReactElement, ReactNode } from 'react';

function isReactElement(element: any): element is ReactElement {
  return typeof element === 'object' && element.props;
}

function getAttribute(element: ReactNode): string | undefined {
  if (!isReactElement(element)) {
    return undefined;
  }

  if (element.props.attribute) {
    return element.props.attribute;
  }
  if (Array.isArray(element.props.attributes)) {
    return element.props.attributes[0];
  }
  if (element.props.children) {
    return getAttribute(React.Children.only(element.props.children));
  }

  return undefined;
}

type DynamicWidgetsProps = {
  children: ReactNode;
  attributesToRender: string[];
  fallbackComponent?: ComponentType<{ attribute: string }>;
};

function DynamicWidgets({
  children,
  attributesToRender,
  fallbackComponent: Fallback = () => null,
}: DynamicWidgetsProps) {
  const widgets: Map<string, ReactNode> = new Map();

  React.Children.forEach(children, (child) => {
    const attribute = getAttribute(child);
    if (!attribute) {
      throw new Error(
        `Could not find "attribute" prop for ${getDisplayName(child)}.`
      );
    }
    widgets.set(attribute, child);
  });

  // on initial render this will be empty, but React InstantSearch keeps
  // search state for unmounted components in place, so routing works.
  return (
    <>
      {attributesToRender.map((attribute) => (
        <Fragment key={attribute}>
          {widgets.get(attribute) || <Fallback attribute={attribute} />}
        </Fragment>
      ))}
    </>
  );
}

export default connectDynamicWidgets(DynamicWidgets, {
  $$widgetType: 'ais.dynamicWidgets',
});
