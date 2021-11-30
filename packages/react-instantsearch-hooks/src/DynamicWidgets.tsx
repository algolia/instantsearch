import React, { Fragment } from 'react';

import { useDynamicWidgets } from './useDynamicWidgets';
import { invariant } from './utils';

import type { DynamicWidgetsConnectorParams } from 'instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets';
import type { ReactChild, ComponentType, ReactNode } from 'react';

function FallbackComponent() {
  return null;
}

export type DynamicWidgetsProps = Pick<
  DynamicWidgetsConnectorParams,
  'transformItems'
> & {
  children: ReactNode;
  fallbackComponent?: ComponentType<{ attribute: string }>;
};

export function DynamicWidgets({
  children,
  fallbackComponent: Fallback = FallbackComponent,
  ...props
}: DynamicWidgetsProps) {
  const { attributesToRender } = useDynamicWidgets(props);
  const widgets: Map<string, ReactChild> = new Map();

  React.Children.forEach(children, (child) => {
    const attribute = getWidgetAttribute(child);

    invariant(
      attribute !== undefined,
      `<DynamicWidgets> only supports InstantSearch widgets with an \`attribute\` or \`attributes\` prop.`
    );

    widgets.set(attribute, child);
  });

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

function getWidgetAttribute(component: ReactChild): string | undefined {
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
    invariant(
      React.Children.count(component.props.children) === 1,
      `<DynamicWidgets> only supports a single component in nested components. Make sure to not render multiple children in a parent component.

Example of an unsupported scenario:

\`\`\`
<DynamicWidgets>
  <MyComponent>
    <RefinementList attribute="brand" />
    <Menu attribute="categories" />
  </MyComponent>
</DynamicWidgets>
\`\`\`
`
    );

    return getWidgetAttribute(React.Children.only(component.props.children));
  }

  return undefined;
}
