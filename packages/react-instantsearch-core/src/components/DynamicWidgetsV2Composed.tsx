import React, { Fragment } from 'react';

import { useDynamicFacetsComposed } from '../connectors/useDynamicFacetsComposed';
import { invariant } from '../lib/invariant';

import type {
  DynamicFacetsComposedConnectorParams,
  FacetSlice,
  WidgetDescriptor,
} from 'instantsearch.js/es/connectors/dynamic-facets-composed/connectDynamicFacetsComposed';
import type { ReactElement, ComponentType, ReactNode } from 'react';

// Re-export the props type under the `Composed` name for external use
export type DynamicFacetComposedComponentProps = {
  attribute: string;
  slice: FacetSlice;
  refine: (value: string) => void;
  toggleShowMore: () => void;
  createURL: (value: string) => string;
};

// ---------------------------------------------------------------------------
// Built-in default renderers
// Inline JSX with ais-* BEM class names — avoids circular dependency on
// react-instantsearch's UI components while working with instantsearch.css.
// ---------------------------------------------------------------------------

function DefaultRefinementList({
  attribute,
  slice,
  refine,
  toggleShowMore,
}: DynamicFacetComposedComponentProps) {
  return (
    <div className="ais-Panel">
      <div className="ais-Panel-header">{attribute}</div>
      <div className="ais-Panel-body">
        <div
          className={`ais-RefinementList${
            !slice.canRefine ? ' ais-RefinementList--noRefinement' : ''
          }`}
        >
          <ul className="ais-RefinementList-list">
            {slice.items.map((item) => (
              <li
                key={item.value}
                className={`ais-RefinementList-item${
                  item.isRefined ? ' ais-RefinementList-item--selected' : ''
                }`}
              >
                <label className="ais-RefinementList-label">
                  <input
                    className="ais-RefinementList-checkbox"
                    type="checkbox"
                    checked={item.isRefined}
                    onChange={() => refine(item.value)}
                  />
                  <span className="ais-RefinementList-labelText">
                    {item.label}
                  </span>
                  <span className="ais-RefinementList-count">{item.count}</span>
                </label>
              </li>
            ))}
          </ul>
          {(slice.canToggleShowMore || slice.isShowingMore) && (
            <button
              className={`ais-RefinementList-showMore${
                !slice.canToggleShowMore
                  ? ' ais-RefinementList-showMore--disabled'
                  : ''
              }`}
              disabled={!slice.canToggleShowMore}
              onClick={toggleShowMore}
            >
              {slice.isShowingMore ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function DefaultMenu({
  attribute,
  slice,
  refine,
  toggleShowMore,
  createURL,
}: DynamicFacetComposedComponentProps) {
  return (
    <div className="ais-Panel">
      <div className="ais-Panel-header">{attribute}</div>
      <div className="ais-Panel-body">
        <div className="ais-Menu">
          <ul className="ais-Menu-list">
            {slice.items.map((item) => (
              <li
                key={item.value}
                className={`ais-Menu-item${
                  item.isRefined ? ' ais-Menu-item--selected' : ''
                }`}
              >
                <a
                  className="ais-Menu-link"
                  href={createURL(item.value)}
                  onClick={(e) => {
                    e.preventDefault();
                    refine(item.value);
                  }}
                >
                  <span className="ais-Menu-label">{item.label}</span>
                  <span className="ais-Menu-count">{item.count}</span>
                </a>
              </li>
            ))}
          </ul>
          {(slice.canToggleShowMore || slice.isShowingMore) && (
            <button
              className={`ais-Menu-showMore${
                !slice.canToggleShowMore ? ' ais-Menu-showMore--disabled' : ''
              }`}
              disabled={!slice.canToggleShowMore}
              onClick={toggleShowMore}
            >
              {slice.isShowingMore ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function ComposedHierarchicalList({
  items,
  refine,
  createURL,
  isChild,
}: {
  items: NonNullable<FacetSlice['hierarchicalItems']>;
  refine: (value: string) => void;
  createURL: (value: string) => string;
  isChild?: boolean;
}) {
  if (items.length === 0) return null;
  return (
    <ul
      className={`ais-HierarchicalMenu-list${
        isChild ? ' ais-HierarchicalMenu-list--child' : ''
      }`}
    >
      {items.map((item) => (
        <li
          key={item.value}
          className={`ais-HierarchicalMenu-item${
            item.isRefined ? ' ais-HierarchicalMenu-item--selected' : ''
          }${
            item.data && item.data.length > 0
              ? ' ais-HierarchicalMenu-item--parent'
              : ''
          }`}
        >
          <a
            className={`ais-HierarchicalMenu-link${
              item.isRefined ? ' ais-HierarchicalMenu-link--selected' : ''
            }`}
            href={createURL(item.value)}
            onClick={(e) => {
              e.preventDefault();
              refine(item.value);
            }}
          >
            <span className="ais-HierarchicalMenu-label">{item.label}</span>
            <span className="ais-HierarchicalMenu-count">{item.count}</span>
          </a>
          {item.data && (
            <ComposedHierarchicalList
              items={item.data}
              refine={refine}
              createURL={createURL}
              isChild
            />
          )}
        </li>
      ))}
    </ul>
  );
}

function DefaultHierarchicalMenu({
  attribute,
  slice,
  refine,
  toggleShowMore,
  createURL,
}: DynamicFacetComposedComponentProps) {
  const items = slice.hierarchicalItems ?? [];
  return (
    <div className="ais-Panel">
      <div className="ais-Panel-header">{attribute}</div>
      <div className="ais-Panel-body">
        <div
          className={`ais-HierarchicalMenu${
            items.length === 0 ? ' ais-HierarchicalMenu--noRefinement' : ''
          }`}
        >
          <ComposedHierarchicalList
            items={items}
            refine={refine}
            createURL={createURL}
          />
          {(slice.canToggleShowMore || slice.isShowingMore) && (
            <button
              className={`ais-HierarchicalMenu-showMore${
                !slice.canToggleShowMore
                  ? ' ais-HierarchicalMenu-showMore--disabled'
                  : ''
              }`}
              disabled={!slice.canToggleShowMore}
              onClick={toggleShowMore}
            >
              {slice.isShowingMore ? 'Show less' : 'Show more'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

const BUILT_IN_RENDERERS: Record<
  string,
  ComponentType<DynamicFacetComposedComponentProps>
> = {
  refinementList: DefaultRefinementList,
  menu: DefaultMenu,
  hierarchicalMenu: DefaultHierarchicalMenu,
};

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export type DynamicWidgetsV2ComposedProps = Omit<
  DynamicFacetsComposedConnectorParams,
  'widgets'
> & {
  widgets: (attribute: string) => WidgetDescriptor | false;

  /**
   * Per-type component overrides.
   */
  components?: Partial<
    Record<string, ComponentType<DynamicFacetComposedComponentProps>>
  >;

  /**
   * Ultimate escape-hatch renderer.
   */
  fallbackComponent?: ComponentType<DynamicFacetComposedComponentProps>;

  children?: ReactNode;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function DynamicWidgetsV2Composed({
  children,
  fallbackComponent: Fallback,
  components: componentOverrides = {},
  widgets: widgetsFn,
  ...props
}: DynamicWidgetsV2ComposedProps) {
  const { attributesToRender, facets, refine, toggleShowMore, createURL } =
    useDynamicFacetsComposed(
      { widgets: widgetsFn, ...props },
      { $$widgetType: 'ais.dynamicFacetsComposed' }
    );

  const explicitWidgets: Map<string, ReactNode> = new Map();

  React.Children.forEach(children, (child) => {
    const attribute = getWidgetAttribute(child);
    if (attribute !== undefined) {
      explicitWidgets.set(attribute, child);
    }
  });

  return (
    <>
      {attributesToRender.map((attribute) => {
        if (explicitWidgets.has(attribute)) {
          return (
            <Fragment key={attribute}>
              {explicitWidgets.get(attribute)}
            </Fragment>
          );
        }

        const slice = facets[attribute];
        if (!slice) return null;

        const facetProps: DynamicFacetComposedComponentProps = {
          attribute,
          slice,
          refine: (value: string) => refine(attribute, value),
          toggleShowMore: () => toggleShowMore(attribute),
          createURL: (value: string) => createURL(attribute, value),
        };

        // Resolution chain: descriptor.component > components[type] > built-in > fallback
        const Component =
          slice.descriptorComponent ??
          componentOverrides[slice.type] ??
          BUILT_IN_RENDERERS[slice.type] ??
          Fallback;

        if (!Component) return null;

        return (
          <Fragment key={attribute}>
            <Component {...facetProps} />
          </Fragment>
        );
      })}
    </>
  );
}

// ---------------------------------------------------------------------------
// Utility: extract attribute from a React child element
// ---------------------------------------------------------------------------

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
      `<DynamicWidgetsV2Composed> only supports a single component in nested components.`
    );

    return getWidgetAttribute(React.Children.only(element.props.children));
  }

  return undefined;
}
