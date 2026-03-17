import React, { Fragment } from 'react';

import { useDynamicWidgets } from '../connectors/useDynamicWidgets';
import { useInstantSearch } from '../hooks/useInstantSearch';
import { invariant } from '../lib/invariant';
import { warn } from '../lib/warn';

import type { DynamicWidgetsConnectorParams } from 'instantsearch.js/es/connectors/dynamic-widgets/connectDynamicWidgets';
import type { ReactElement, ComponentType, ReactNode } from 'react';

function DefaultFallbackComponent() {
  return null;
}

type AtLeastOne<
  TTarget,
  TMapped = { [Key in keyof TTarget]: Pick<TTarget, Key> }
> = Partial<TTarget> & TMapped[keyof TMapped];

export type DynamicWidgetsProps = Omit<
  DynamicWidgetsConnectorParams,
  'widgets' | 'fallbackWidget'
> &
  AtLeastOne<{
    children: ReactNode;
    fallbackComponent: ComponentType<{
      attribute: string;
      canRefine: boolean;
      facetValues: Record<string, number>;
    }>;
  }> & {
    /**
     * Rendering mode for dynamic widgets.
     * - `"default"`: Traditional per-facet widget rendering (default for backward compatibility).
     * - `"batched"`: Optimized for high-facet scenarios; renders all facets through a single batched component.
     *
     * @default "default"
     */
    mode?: 'default' | 'batched';
  };

export function DynamicWidgets({
  children,
  fallbackComponent: Fallback = DefaultFallbackComponent,
  mode = 'default',
  ...props
}: DynamicWidgetsProps) {
  const INITIAL_WIDGET_BUDGET = 50;
  const WIDGET_BUDGET_CHUNK = 50;

  const FallbackComponent = React.useRef(Fallback);

  warn(
    Fallback === FallbackComponent.current,
    'The `fallbackComponent` prop of `DynamicWidgets` changed between renders. Please provide a stable reference, as described in https://www.algolia.com/doc/api-reference/widgets/dynamic-facets/react/#widget-param-fallbackcomponent'
  );

  const { attributesToRender } = useDynamicWidgets(props, {
    $$widgetType: 'ais.dynamicWidgets',
  });
  const { results, indexUiState } = useInstantSearch();
  const rawFacets = results?._rawResults?.[0]?.facets;
  const resultsFacets = results?.facets;
  const facets: Record<string, Record<string, number>> =
    (rawFacets && !Array.isArray(rawFacets) ? rawFacets : undefined) ||
    (resultsFacets && !Array.isArray(resultsFacets) ? resultsFacets : {});
  const refinedAttributes = React.useMemo(
    () => getRefinedAttributes(indexUiState),
    [indexUiState]
  );
  const [renderBudget, setRenderBudget] = React.useState(
    Math.min(INITIAL_WIDGET_BUDGET, attributesToRender.length)
  );

  React.useEffect(() => {
    setRenderBudget(Math.min(INITIAL_WIDGET_BUDGET, attributesToRender.length));
  }, [attributesToRender.length]);

  React.useEffect(() => {
    if (mode !== 'default') {
      return;
    }

    if (renderBudget >= attributesToRender.length) {
      return;
    }

    const timeoutId = setTimeout(() => {
      setRenderBudget((previous) =>
        Math.min(previous + WIDGET_BUDGET_CHUNK, attributesToRender.length)
      );
    }, 0);

    return () => {
      clearTimeout(timeoutId);
    };
  }, [mode, renderBudget, attributesToRender.length]);

  const attributesToRenderWithBudget = React.useMemo(
    () =>
      attributesToRender.filter(
        (attribute, index) =>
          index < renderBudget ||
          refinedAttributes.has(getNormalizedFacetAttribute(attribute))
      ),
    [attributesToRender, renderBudget, refinedAttributes]
  );
  const widgets: Map<string, ReactNode> = new Map();

  React.Children.forEach(children, (child) => {
    const attribute = getWidgetAttribute(child);

    invariant(
      attribute !== undefined,
      `<DynamicWidgets> only supports InstantSearch widgets with an \`attribute\` or \`attributes\` prop.`
    );

    widgets.set(attribute, child);
  });

  // In batched mode, skip per-widget mounting and render all facets as presentational components
  if (mode === 'batched') {
    return (
      <>
        {attributesToRender.map((attribute) => (
          <Fragment key={attribute}>
            <FallbackComponent.current
              attribute={attribute}
              canRefine={
                Object.keys(facets[getNormalizedFacetAttribute(attribute)] || {})
                  .length > 0
              }
              facetValues={facets[getNormalizedFacetAttribute(attribute)] || {}}
            />
          </Fragment>
        ))}
      </>
    );
  }

  // Default mode: traditional per-widget rendering with facet metadata available
  return (
    <>
      {attributesToRenderWithBudget.map((attribute) => (
        <Fragment key={attribute}>
          {widgets.get(attribute) || (
            <FallbackComponent.current
              attribute={attribute}
              canRefine={
                Object.keys(facets[getNormalizedFacetAttribute(attribute)] || {})
                  .length > 0
              }
              facetValues={facets[getNormalizedFacetAttribute(attribute)] || {}}
            />
          )}
        </Fragment>
      ))}
    </>
  );
}

function getNormalizedFacetAttribute(attribute: string): string {
  return attribute
    .replace(/^searchable\(/, '')
    .replace(/^filterOnly\(/, '')
    .replace(/\)$/, '');
}

function getRefinedAttributes(indexUiState: Record<string, unknown>) {
  const refinedAttributes = new Set<string>();

  const refinementList = (indexUiState.refinementList || {}) as Record<
    string,
    string[]
  >;
  Object.keys(refinementList).forEach((attribute) => {
    if ((refinementList[attribute] || []).length > 0) {
      refinedAttributes.add(attribute);
    }
  });

  const menu = (indexUiState.menu || {}) as Record<string, string>;
  Object.keys(menu).forEach((attribute) => {
    if (menu[attribute]) {
      refinedAttributes.add(attribute);
    }
  });

  const hierarchicalMenu = (indexUiState.hierarchicalMenu || {}) as Record<
    string,
    string[]
  >;
  Object.keys(hierarchicalMenu).forEach((attribute) => {
    if ((hierarchicalMenu[attribute] || []).length > 0) {
      refinedAttributes.add(attribute);
    }
  });

  const toggle = (indexUiState.toggle || {}) as Record<string, boolean>;
  Object.keys(toggle).forEach((attribute) => {
    if (toggle[attribute]) {
      refinedAttributes.add(attribute);
    }
  });

  return refinedAttributes;
}

function isReactElement(
  element: any
): element is ReactElement<Record<string, any>> {
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
