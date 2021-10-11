import type { ReactChild, ComponentType, ReactNode } from 'react';
import React, { Fragment } from 'react';
import { getDisplayName } from '../core/utils';
import connectDynamicWidgets from '../connectors/connectDynamicWidgets';

function getAttribute(component: ReactChild): string | undefined {
  if (typeof component !== 'object') {
    return undefined;
  }

  if (component.props.attribute) {
    return component.props.attribute;
  }
  if (Array.isArray(component.props.attributes)) {
    return component.props.attributes[0];
  }
  if (component.props.children) {
    return getAttribute(React.Children.only(component.props.children));
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
  const widgets: Map<string, ReactChild> = new Map();

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

export default connectDynamicWidgets(DynamicWidgets);
