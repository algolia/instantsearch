import React, { Fragment } from 'react';

import { useDynamicWidgets } from '../connectors/useDynamicWidgets';
import { invariant } from '../lib/invariant';

import type { DynamicWidgetsConnectorParams } from 'instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets';
import type { ReactElement, ComponentType, ReactNode } from 'react';

function FallbackComponent() {
  return null;
}

type AtLeastOne<
  TTarget,
  TMapped = { [Key in keyof TTarget]: Pick<TTarget, Key> }
> = Partial<TTarget> & TMapped[keyof TMapped];

export type DynamicWidgetsProps = Pick<
  DynamicWidgetsConnectorParams,
  'transformItems'
> &
  AtLeastOne<{
    children: ReactNode;
    fallbackComponent: ComponentType<{ attribute: string }>;
  }>;

export function DynamicWidgets({
  children,
  fallbackComponent: Fallback = FallbackComponent,
  ...props
}: DynamicWidgetsProps) {
  const { attributesToRender } = useDynamicWidgets(props, {
    $$widgetType: 'ais.dynamicWidgets',
  });
  const widgets: Map<string, ReactNode> = new Map();

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

function isReactElement(element: any): element is ReactElement {
  return typeof element === 'object' && element.props;
}

function getWidgetAttribute(element: ReactNode): string | undefined {
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
    invariant(
      React.Children.count(element.props.children) === 1,
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

    return getWidgetAttribute(React.Children.only(element.props.children));
  }

  return undefined;
}
