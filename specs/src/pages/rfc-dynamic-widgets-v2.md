# RFC: DynamicWidgets v2 — Shared Facet State Architecture

**Status:** Draft (with working PoC)

**Authors:** Haroen Viaene (and Claude Opus 4.6)

**Date:** 2026-03-18

**Related:** [PR #6930](https://github.com/algolia/instantsearch/pull/6930), [PR #6929](https://github.com/algolia/instantsearch/pull/6929)

**PoC:** `examples/react/dynamic-widgets-v2/`

---

## Summary

DynamicWidgets v2 replaces the current "one widget per dynamic facet" model with a single shared facet store that serves many lightweight renderers. The goal is to scale from the current practical limit of ~20–50 dynamic facets to hundreds, without application slowdowns or crashes, while preserving full interactivity (refinement, showMore, routing).

## Motivation

### The problem

When `DynamicWidgets` renders N facets today, it mounts N independent widget instances. Each widget:

1. **Registers search parameters** via `getWidgetSearchParameters` — adding a facet/disjunctiveFacet/hierarchicalFacet to the helper state.
2. **Triggers a search** when added — `addWidgets` calls `instantSearchInstance.scheduleSearch()`.
3. **Computes its own render state** via `getWidgetRenderState` — reading from `SearchResults`, formatting items, creating action closures.
4. **Manages its own lifecycle** — `init`, `render`, `dispose`, with GC pressure from closures and event listeners.

At 200+ facets, this causes:

- **O(N) widget registrations** in the Index widget's `localWidgets` array.
- **O(N) `getWidgetSearchParameters` calls** per search parameter rebuild, each mutating a `SearchParameters` object via immutable copies.
- **O(N) connector computation** per render cycle.
- **O(N) React reconciliation** for `useConnector` hook instances.
- **Extra network requests** when widgets mount progressively.

### What we tried in PR #6930

1. **`mode="batched"`** — renders all facets through a single fallback component, bypassing per-widget mounting entirely. Fast, but loses all widget behavior (refinement, searchForFacetValues, showMore, routing).
2. **Progressive/idle mounting** — mounts widgets in chunks via `requestIdleCallback`. Helps initial render, but each chunk triggers another search, and the total cost is unchanged once all widgets are mounted.

### Why incremental fixes aren't enough

The fundamental issue is architectural: the widget interface (`init` / `render` / `dispose` / `getWidgetSearchParameters`) was designed assuming widgets are few and long-lived. DynamicWidgets subverts this assumption by making widget count data-driven and potentially unbounded.

## Design Principles

1. **Facet state is computed once, consumed many times.** One store, many views.
2. **Widget count should not affect search parameter count.** Facets should be registered declaratively by the store, not imperatively by each widget.
3. **Interactive behavior (refine, showMore) must be preserved.**
4. **Backward compatibility.** Existing `DynamicWidgets` users should not break.
5. **Framework-agnostic at the connector level.** The solution must work for React, Vue, and vanilla JS.

## Proposed Architecture

### Overview

```
┌──────────────────────────────────────────────────────┐
│                    DynamicWidgets v2                  │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │         connectDynamicFacets (connector)       │  │
│  │                                                │  │
│  │  • ONE widget registration in the Index        │  │
│  │  • Registers facets: ['*'] (or explicit list)  │  │
│  │  • Reads facetOrdering from results            │  │
│  │  • Builds normalized facet store from results  │  │
│  │  • Exposes refinement actions                  │  │
│  └──────────────┬─────────────────────────────────┘  │
│                 │                                    │
│        Facet store (render state)                    │
│        {                                             │
│          attributesToRender: string[]                 │
│          facets: Record<attribute, FacetSlice>        │
│          refine(attribute, value): void               │
│          toggleShowMore(attribute): void              │
│          createURL(attribute, value): string          │
│        }                                             │
│                 │                                    │
│   ┌─────────────┼──────────────┐                     │
│   ▼             ▼              ▼                     │
│ FacetView    FacetView    FacetView                  │
│ (brand)     (color)      (category)                  │
│                                                      │
│ Pure rendering components. No widget registration.   │
│ Receive their slice of state + bound action refs.    │
└──────────────────────────────────────────────────────┘
```

### 1. New connector: `connectDynamicFacets`

A new connector in `packages/instantsearch.js/src/connectors/dynamic-facets/`. This is **one widget** registered with the Index, regardless of how many facets are displayed.

#### Attribute-to-widget mapping: the `widgets` function

The connector needs to know _how_ each attribute should be faceted. Today this is implicit in which widget is used. In v2, this mapping is **explicit and declarative** via a `widgets` function:

```ts
type DynamicFacetsConnectorParams = {
  widgets: (attribute: string) => WidgetDescriptor | false;
  facets?: ['*'] | string[];
  maxValuesPerFacet?: number;
  transformItems?: TransformItems<string>;
};
```

##### Widget descriptors (discriminated union)

```ts
type WidgetDescriptor =
  | RefinementListDescriptor // disjunctive/conjunctive facet
  | MenuDescriptor // single-select hierarchical
  | HierarchicalMenuDescriptor // multi-level hierarchical
  | ToggleRefinementDescriptor // boolean toggle
  | NumericMenuDescriptor // numeric range buckets
  | RangeDescriptor // continuous numeric range
  | RatingMenuDescriptor; // star rating

type RefinementListDescriptor = {
  type: 'refinementList';
  operator?: 'and' | 'or';
  limit?: number;
  showMoreLimit?: number;
  searchable?: boolean;
};

type MenuDescriptor = {
  type: 'menu';
  limit?: number;
  showMoreLimit?: number;
};

type HierarchicalMenuDescriptor = {
  type: 'hierarchicalMenu';
  attributes: string[];
  separator?: string;
  rootPath?: string | null;
  showParentLevel?: boolean;
  limit?: number;
  showMoreLimit?: number;
};

type ToggleRefinementDescriptor = {
  type: 'toggleRefinement';
  on?: string | string[] | boolean;
  off?: string | string[] | boolean;
};

type NumericMenuDescriptor = {
  type: 'numericMenu';
  items: Array<{ label: string; start?: number; end?: number }>;
};

type RangeDescriptor = {
  type: 'range';
  min?: number;
  max?: number;
  precision?: number;
};

type RatingMenuDescriptor = {
  type: 'ratingMenu';
  max?: number;
};
```

##### Usage examples

```tsx
// Simplest case — everything is a RefinementList
<DynamicWidgetsV2
  widgets={() => ({ type: 'refinementList' })}
  fallbackComponent={FacetRenderer}
/>

// Mixed widget types
<DynamicWidgetsV2
  widgets={(attribute) => {
    if (attribute === 'hierarchicalCategories.lvl1')
      return {
        type: 'hierarchicalMenu',
        attributes: ['hierarchicalCategories.lvl1', 'hierarchicalCategories.lvl2', 'hierarchicalCategories.lvl3'],
      };
    if (attribute === 'brand')
      return { type: 'menu', limit: 5, showMoreLimit: 20 };
    return { type: 'refinementList', limit: 5, showMoreLimit: 20 };
  }}
  fallbackComponent={FacetRenderer}
/>
```

##### Why a function instead of a static map?

1. **Handles unknown attributes.** `facetOrdering` can return new attributes. A function always has a default path.
2. **Allows dynamic logic.** The mapping can depend on runtime state, feature flags, server config.
3. **Composable.** `widgets={(attr) => serverConfig[attr] ?? localOverrides[attr] ?? defaultWidget}`

#### The two-search bootstrapping problem

A key challenge discovered during PoC: the connector can't know which attributes to register until it receives the first search results (which contain `facetOrdering`). This creates a bootstrapping problem:

- **`refinementList`** works with `facets: ['*']` on the first search because the raw API response includes flat facet values for all attributes.
- **`menu`** and **`hierarchicalMenu`** require explicit `addHierarchicalFacet()` registration, otherwise `getFacetValues()` returns `undefined`.

**Solution: two-phase bootstrapping with raw fallback**

1. **First search:** Only `facets: ['*']` is sent. The connector discovers attributes from `facetOrdering` and uses raw API response data (`results._rawResults[0].facets[attribute]`) as a fallback to show flat values immediately.
2. **`render()` detects unregistered facets:** After `knownAttributes` is populated, `render()` checks if any attributes need proper registration. If so, it calls `helper.setState(params)` + `scheduleSearch()`.
3. **Second search:** The helper now has proper hierarchical facet registrations. `getFacetValues()` returns correct tree structures.

The guard `!params.isHierarchicalFacet(attr)` prevents infinite loops — re-search only happens when facets are genuinely not yet registered.

```ts
render(renderOptions) {
  const renderState = this.getWidgetRenderState(renderOptions);
  const { helper } = renderOptions;

  if (helper && knownAttributes.length > 0) {
    let needsReSearch = false;
    let params = helper.state;

    for (const attr of knownAttributes) {
      const desc = resolveDescriptor(widgetsFn, attr);
      if (!desc) continue;
      switch (desc.type) {
        case 'menu':
          if (!params.isHierarchicalFacet(attr)) {
            params = params.addHierarchicalFacet({ name: attr, attributes: [attr] });
            needsReSearch = true;
          }
          break;
        case 'hierarchicalMenu':
          if (!params.isHierarchicalFacet(desc.attributes[0])) {
            params = params.addHierarchicalFacet({
              name: desc.attributes[0],
              attributes: desc.attributes,
              separator: desc.separator ?? ' > ',
            });
            needsReSearch = true;
          }
          break;
        // ...
      }
    }
    if (needsReSearch) {
      helper.setState(params);
      renderOptions.instantSearchInstance.scheduleSearch();
    }
  }
  renderFn({ ...renderState, instantSearchInstance }, false);
}
```

**Note:** `getWidgetSearchParameters` is only called during `addWidgets`/`init`, not after `render()`. This is why `render()` must directly mutate the helper state. A future optimization could pre-register all facets if the attribute list is known ahead of time.

#### Search parameter registration

`getWidgetSearchParameters` registers search parameters for ALL managed attributes in one pass. It also reads from `uiState` to restore refinements from the URL (routing):

```ts
getWidgetSearchParameters(searchParameters, { uiState }) {
  let params = searchParameters;

  // 1. Global facet request (discovery)
  for (const facet of facets) {
    params = params.addFacet(facet);
  }
  params = params.setQueryParameter('maxValuesPerFacet',
    Math.max(maxValuesPerFacet || 0, params.maxValuesPerFacet || 0));

  // 2. Merge known attributes + refined attributes from uiState
  const attributesToRegister = new Set<string>(knownAttributes);
  Object.keys(uiState.refinementList || {}).forEach(attr => attributesToRegister.add(attr));
  Object.keys(uiState.menu || {}).forEach(attr => attributesToRegister.add(attr));
  Object.keys(uiState.toggle || {}).forEach(attr => attributesToRegister.add(attr));

  // 3. Register each attribute according to its descriptor type
  for (const attribute of attributesToRegister) {
    const desc = resolveDescriptor(widgetsFn, attribute);
    if (!desc) continue;

    // Guard: skip if already registered
    const alreadyRegistered = params.isHierarchicalFacet(attribute)
      || params.isDisjunctiveFacet(attribute) || params.isConjunctiveFacet(attribute);

    switch (desc.type) {
      case 'refinementList': {
        const isDisjunctive = (desc.operator ?? 'or') === 'or';
        if (!alreadyRegistered) {
          params = isDisjunctive ? params.addDisjunctiveFacet(attribute) : params.addFacet(attribute);
        }
        // Apply refinements from uiState...
        break;
      }
      case 'menu': {
        if (!alreadyRegistered) {
          params = params.addHierarchicalFacet({ name: attribute, attributes: [attribute] });
        }
        // Apply refinement from uiState.menu...
        break;
      }
      case 'hierarchicalMenu': {
        if (!params.isHierarchicalFacet(desc.attributes[0])) {
          params = params.addHierarchicalFacet({
            name: desc.attributes[0], attributes: desc.attributes,
            separator: desc.separator ?? ' > ',
          });
        }
        // Apply refinement from uiState.hierarchicalMenu...
        break;
      }
      case 'toggleRefinement': {
        if (!alreadyRegistered) params = params.addDisjunctiveFacet(attribute);
        break;
      }
    }
  }
  return params;
}
```

#### Helper data format transformation

The helper's `getFacetValues()` returns items in internal format (`{ name, escapedValue, path, data }`). InstantSearch UI components expect `{ label, value, data }`. The connector transforms recursively:

```ts
function prepareHierarchicalItems(facetValues: any[]): HierarchicalMenuItem[] {
  return facetValues.map(({ name, escapedValue, data, path, ...rest }) => ({
    ...rest,
    label: String(name),
    value: String(escapedValue ?? path ?? name),
    data: Array.isArray(data) ? prepareHierarchicalItems(data) : null,
  }));
}
```

This applies to both `hierarchicalMenu` and `menu` items (menu is hierarchical internally in the helper).

#### Normalized render state

```ts
type FacetSlice = {
  type: WidgetDescriptor['type'];
  attribute: string;
  items: RefinementListItem[]; // flat items (refinementList, menu)
  hierarchicalItems?: HierarchicalMenuItem[]; // tree items (hierarchicalMenu)
  canRefine: boolean;
  isShowingMore: boolean;
  canToggleShowMore: boolean;
  hasExhaustiveItems: boolean;
};

type DynamicFacetsRenderState = {
  attributesToRender: string[];
  facets: Record<string, FacetSlice>;
  refine: (attribute: string, value: string) => void;
  toggleShowMore: (attribute: string) => void;
  createURL: (attribute: string, value: string) => string;
};
```

`getWidgetRenderState` iterates `attributesToRender` once, building all slices. For each attribute it:

1. Resolves the descriptor via `widgetsFn(attribute)`
2. Tries `results.getFacetValues()` for processed data
3. Falls back to `results._rawResults[0].facets[attribute]` if not yet registered
4. Transforms hierarchical data via `prepareHierarchicalItems()`
5. Applies `limit`/`showMoreLimit` slicing

#### Refinement dispatch

Centralized, dispatching based on descriptor type:

```ts
const refine = (attribute: string, value: string) => {
  const desc = resolvedDescriptors.get(attribute);
  switch (desc.type) {
    case 'refinementList':
      ensureRegistered(attribute);
      helper.toggleFacetRefinement(attribute, value).search();
      break;
    case 'menu':
      ensureHierarchical(attribute);
      // Single-select: remove then add
      helper
        .removeHierarchicalFacetRefinement(attribute)
        .addHierarchicalFacetRefinement(attribute, value)
        .search();
      break;
    case 'hierarchicalMenu':
      ensureHierarchical(desc.attributes[0]);
      helper.toggleFacetRefinement(desc.attributes[0], value).search();
      break;
    case 'toggleRefinement':
      ensureRegistered(attribute);
      helper.toggleFacetRefinement(attribute, value).search();
      break;
  }
};
```

### 2. UI State and Routing

`getWidgetUiState` scans `searchParameters` directly (not the render-time cache), because it's called on every helper `change` event — potentially before rendering.

| Descriptor type    | uiState key              |
| ------------------ | ------------------------ |
| `refinementList`   | `refinementList[attr]`   |
| `menu`             | `menu[attr]`             |
| `hierarchicalMenu` | `hierarchicalMenu[attr]` |
| `toggleRefinement` | `toggle[attr]`           |

The same keys used by standalone widgets, ensuring routing compatibility.

### 3. React layer

**`useDynamicFacets` hook** — wraps `connectDynamicFacets` via `useConnector`. One call = one widget = one search.

**`<DynamicWidgetsV2>` component:**

```tsx
export function DynamicWidgetsV2({
  children,
  fallbackComponent: Fallback,
  widgets,
  ...props
}) {
  const { attributesToRender, facets, refine, toggleShowMore, createURL } =
    useDynamicFacets({ widgets, ...props });

  const explicitWidgets = new Map();
  React.Children.forEach(children, (child) => {
    const attr = getWidgetAttribute(child);
    if (attr) explicitWidgets.set(attr, child);
  });

  return (
    <>
      {attributesToRender.map((attribute) => {
        if (explicitWidgets.has(attribute))
          return (
            <Fragment key={attribute}>
              {explicitWidgets.get(attribute)}
            </Fragment>
          );
        const slice = facets[attribute];
        if (!slice) return null;
        return (
          <Fragment key={attribute}>
            <Fallback
              attribute={attribute}
              slice={slice}
              refine={(v) => refine(attribute, v)}
              toggleShowMore={() => toggleShowMore(attribute)}
              createURL={(v) => createURL(attribute, v)}
            />
          </Fragment>
        );
      })}
    </>
  );
}
```

The `fallbackComponent` receives `DynamicFacetComponentProps` and switches on `slice.type` to render the appropriate UI. It can reuse existing UI components (`RefinementListUi`, `MenuUi`, `HierarchicalMenuUi`).

### 4. Unified rendering: eliminating the double-declaration problem

The PoC API requires users to declare intent twice:

1. **In `widgets`:** "brand is a menu" — `{ type: 'menu', limit: 5 }`
2. **In `fallbackComponent`:** "if it's a menu, render MenuUi" — `switch (slice.type) { case 'menu': ... }`

The `switch` in `fallbackComponent` always mirrors what `widgets` already declared. This is boilerplate that the library should handle.

#### Built-in default renderers

The component ships with built-in renderers for every known `type`. When `slice.type === 'refinementList'`, the component uses the existing `RefinementListUi` automatically — no `fallbackComponent` needed for the common case.

```ts
// Internal: default renderer map
const BUILT_IN_RENDERERS: Record<
  string,
  ComponentType<DynamicFacetComponentProps>
> = {
  refinementList: DefaultRefinementList, // wraps RefinementListUi
  menu: DefaultMenu, // wraps MenuUi
  hierarchicalMenu: DefaultHierarchicalMenu, // wraps HierarchicalMenuUi
  toggleRefinement: DefaultToggle, // wraps ToggleRefinementUi
};
```

#### The `components` prop: per-type override

A new optional `components` prop lets users replace the renderer for an entire widget type:

```tsx
<DynamicWidgetsV2
  widgets={widgetsFn}
  facets={['*']}
  components={{
    menu: FancyMenu, // all menus use this
    refinementList: ColorGrid, // all refinementLists use this
  }}
/>
```

#### Per-attribute `component` in the descriptor

The descriptor itself can carry a renderer, so a specific attribute gets a custom component without affecting all other attributes of the same type:

```tsx
widgets={(attr) => {
  if (attr === 'brand') return {
    type: 'menu', limit: 5,
    component: BrandSelector, // only brand uses this
  };
  return { type: 'refinementList' };
}}
```

#### Resolution chain

Renderer resolution follows a 4-level priority:

1. **`descriptor.component`** — per-attribute override from the `widgets` function
2. **`components[type]`** — per-type override from the `components` prop
3. **Built-in default** — library-provided renderer using existing UI components
4. **`fallbackComponent`** — ultimate escape hatch for unknown types or total control

#### Updated component API

```tsx
type DynamicWidgetsV2Props = {
  // Declares facet types (connector-level, framework-agnostic)
  widgets: (attribute: string) => WidgetDescriptor | false;
  facets?: ['*'] | string[];
  maxValuesPerFacet?: number;
  transformItems?: TransformItems<string>;

  // Rendering customization (React-level)
  components?: Partial<
    Record<WidgetDescriptor['type'], ComponentType<DynamicFacetComponentProps>>
  >;
  fallbackComponent?: ComponentType<DynamicFacetComponentProps>;
  children?: React.ReactNode; // explicit children still win
};
```

#### Updated component implementation

```tsx
export function DynamicWidgetsV2({
  children,
  fallbackComponent: Fallback,
  components: componentOverrides = {},
  widgets,
  ...props
}: DynamicWidgetsV2Props) {
  const { attributesToRender, facets, refine, toggleShowMore, createURL } =
    useDynamicFacets({ widgets, ...props });

  const explicitWidgets = new Map();
  React.Children.forEach(children, (child) => {
    const attr = getWidgetAttribute(child);
    if (attr) explicitWidgets.set(attr, child);
  });

  return (
    <>
      {attributesToRender.map((attribute) => {
        if (explicitWidgets.has(attribute))
          return (
            <Fragment key={attribute}>
              {explicitWidgets.get(attribute)}
            </Fragment>
          );

        const slice = facets[attribute];
        if (!slice) return null;

        const facetProps: DynamicFacetComponentProps = {
          attribute,
          slice,
          refine: (v) => refine(attribute, v),
          toggleShowMore: () => toggleShowMore(attribute),
          createURL: (v) => createURL(attribute, v),
        };

        // Resolution chain: descriptor.component > components[type] > built-in > fallback
        const Component =
          slice.descriptorComponent ?? // 1. per-attribute
          componentOverrides[slice.type] ?? // 2. per-type
          BUILT_IN_RENDERERS[slice.type] ?? // 3. built-in
          Fallback; // 4. escape hatch

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
```

#### Usage examples

**Zero-config** — just declare types, rendering is automatic:

```tsx
<DynamicWidgetsV2
  widgets={(attr) => {
    if (attr.startsWith('hierarchicalCategories'))
      return { type: 'hierarchicalMenu', attributes: ['...lvl0', '...lvl1'] };
    if (attr === 'brand') return { type: 'menu' };
    return { type: 'refinementList' };
  }}
  facets={['*']}
/>
```

**Per-type override** — custom menu rendering for all menus:

```tsx
<DynamicWidgetsV2
  widgets={widgetsFn}
  facets={['*']}
  components={{ menu: FancyMenu }}
/>
```

**Per-attribute override** — brand gets a special component:

```tsx
<DynamicWidgetsV2
  widgets={(attr) => {
    if (attr === 'brand') return { type: 'menu', component: BrandPicker };
    return { type: 'refinementList' };
  }}
  facets={['*']}
/>
```

**Full custom** — escape hatch for total control:

```tsx
<DynamicWidgetsV2
  widgets={widgetsFn}
  facets={['*']}
  fallbackComponent={({ attribute, slice, refine }) => (
    <MyCustomFacet
      attribute={attribute}
      items={slice.items}
      onRefine={refine}
    />
  )}
/>
```

#### Impact on the descriptor type

The `component` field is added as an optional property on all descriptors:

```ts
type RefinementListDescriptor = {
  type: 'refinementList';
  operator?: 'and' | 'or';
  limit?: number;
  showMoreLimit?: number;
  component?: ComponentType<DynamicFacetComponentProps>; // per-attribute override
};
// Same for MenuDescriptor, HierarchicalMenuDescriptor, etc.
```

Note: `component` is a React-level concern. At the connector level (vanilla JS / Vue), the render function receives `slice.descriptorComponent` and can handle it however the framework adapter chooses.

#### Why this matters

This eliminates the most common boilerplate in real-world usage. Most users won't need `fallbackComponent` at all — they declare types in `widgets` and get correct rendering automatically. The layered override system provides an escape hatch at every level without adding complexity for the simple case.

## Code reuse: avoiding reimplementing standalone connectors

### The problem

The PoC connector reimplements significant logic from `connectRefinementList`, `connectMenu`, `connectHierarchicalMenu`, and `connectToggleRefinement`:

| Concern | Standalone connector | PoC reimplements? |
| --- | --- | --- |
| Search parameter registration | `getWidgetSearchParameters` | Yes — addFacet/addDisjunctiveFacet/addHierarchicalFacet |
| Facet value reading + formatting | `getWidgetRenderState` | Yes — getFacetValues, raw fallback, item shape mapping |
| Refinement dispatch | `refine()` closure | Yes — toggleFacetRefinement, add/removeHierarchicalFacetRefinement |
| UI state serialization | `getWidgetUiState` | Yes — scan searchParameters for refinements |
| ShowMore state | Closure-local boolean | Yes — per-attribute Map |
| Insights / sendEvent | `createSendEventForFacet` | No (missing in PoC) |
| searchForFacetValues (SFFV) | `searchForItems()` closure | No (missing in PoC) |

This duplication means bug fixes in standalone connectors won't propagate, and adding new facet types requires copying their logic.

### Proposed solution: virtual widget instances

Instead of reimplementing each facet type's logic, the dynamic facets connector can **instantiate standalone connectors as virtual widgets** — never mounted in the Index, but called as plain objects:

```ts
// Create a virtual widget (no-op renderFn, never mounted)
const virtualWidget = connectRefinementList(() => {})({
  attribute: 'brand',
  operator: 'or',
  limit: 10,
});

// Reuse its methods directly:
params = virtualWidget.getWidgetSearchParameters!(params, { uiState });
uiState = virtualWidget.getWidgetUiState!(uiState, { searchParameters });
const renderState = virtualWidget.getWidgetRenderState!(renderOptions);
```

These virtual instances are stored in a persistent `Map<string, Widget>` keyed by attribute, so their closure state (showMore toggle, lazy-bound `refine`/`sendEvent`) survives across renders.

### Reuse feasibility per method

| Method | Reusable? | Notes |
| --- | --- | --- |
| `getWidgetSearchParameters` | **Yes, fully** | Pure function: `(SearchParameters, { uiState }) → SearchParameters`. No closure dependencies. |
| `getWidgetUiState` | **Yes, fully** | Pure function: `(uiState, { searchParameters }) → IndexUiState`. No closure dependencies. |
| `getWidgetRenderState` | **Yes, with caveats** | Lazily binds to `helper`/`instantSearchInstance` on first call. Needs real `renderOptions` forwarded from the dynamic facets connector. |
| `refine()` | **Yes** | Bound to `helper` on first `getWidgetRenderState` call. Works if `helper` is the real one from the parent Index. |
| `toggleShowMore` | **Partial** | Calls `widget.render!()` internally, which calls the no-op `renderFn`. Dynamic connector must re-read state after toggle. |
| `searchForItems` (SFFV) | **No** | Calls `renderFn()` directly with SFFV results. Needs a wrapper or separate implementation. |
| `sendEvent` | **Yes** | Lazy-initialized from `helper` + `instantSearchInstance`. |

### How it would work

```ts
// In the dynamic facets connector closure:
const virtualWidgets = new Map<string, Widget>();

function getOrCreateVirtual(attribute: string, desc: WidgetDescriptor): Widget {
  const key = attribute;
  if (virtualWidgets.has(key)) return virtualWidgets.get(key)!;

  let widget: Widget;
  switch (desc.type) {
    case 'refinementList':
      widget = connectRefinementList(() => {})({
        attribute, operator: desc.operator, limit: desc.limit,
        showMoreLimit: desc.showMoreLimit,
      });
      break;
    case 'menu':
      widget = connectMenu(() => {})({
        attribute, limit: desc.limit, showMoreLimit: desc.showMoreLimit,
      });
      break;
    case 'hierarchicalMenu':
      widget = connectHierarchicalMenu(() => {})({
        attributes: desc.attributes, separator: desc.separator,
        rootPath: desc.rootPath, showParentLevel: desc.showParentLevel,
        limit: desc.limit, showMoreLimit: desc.showMoreLimit,
      });
      break;
    case 'toggleRefinement':
      widget = connectToggleRefinement(() => {})({
        attribute, on: desc.on, off: desc.off,
      });
      break;
    // ...
  }
  virtualWidgets.set(key, widget!);
  return widget!;
}

// getWidgetSearchParameters: chain through virtual widgets
getWidgetSearchParameters(searchParameters, { uiState }) {
  let params = searchParameters;
  // Register facets: ['*'] for discovery
  for (const facet of facets) params = params.addFacet(facet);

  // Delegate to each virtual widget
  for (const attribute of attributesToRegister) {
    const desc = resolveDescriptor(widgetsFn, attribute);
    if (!desc) continue;
    const vw = getOrCreateVirtual(attribute, desc);
    params = vw.getWidgetSearchParameters!(params, { uiState });
  }
  return params;
}

// getWidgetRenderState: collect render state from virtual widgets
getWidgetRenderState(renderOptions) {
  const facets: Record<string, FacetSlice> = {};
  for (const attribute of attributesToRender) {
    const desc = resolveDescriptor(widgetsFn, attribute);
    if (!desc) continue;
    const vw = getOrCreateVirtual(attribute, desc);
    // Forward real renderOptions so lazy bindings work
    const rs = vw.getWidgetRenderState!(renderOptions);
    // Normalize to FacetSlice
    facets[attribute] = {
      type: desc.type, attribute,
      items: rs.items, refine: rs.refine,
      // ... map other fields
    };
  }
  return { attributesToRender, facets, ... };
}
```

### Tradeoffs

**Advantages:**

- Eliminates ~80% of reimplemented code from the PoC
- Bug fixes in standalone connectors (e.g., refinement edge cases, Insights events) propagate automatically
- SFFV and sendEvent come "for free" (except SFFV render pipeline)
- Adding new facet types requires only a new `case` in the factory, not reimplementing their logic

**Disadvantages:**

- Creates N virtual widget objects in memory (but: plain objects, no DOM, no React hooks — much cheaper than mounted widgets)
- Each virtual widget has its own `refine()` closure bound to `helper` — the dynamic connector exposes a unified `refine(attribute, value)` that dispatches to the right virtual widget's `refine(value)`
- `FacetSlice` becomes a normalized view over heterogeneous render state types (refinementList returns `{ items, refine, searchForItems }`, menu returns `{ items, refine }`, etc.)
- Virtual widget `toggleShowMore` calls `renderFn` (the no-op), so the dynamic connector must detect state changes and re-render itself
- The two-search bootstrap problem remains: virtual widgets still need `render()` to detect unregistered hierarchical facets

### Comparison: current PoC vs virtual widgets

| Aspect | Current PoC (monolithic) | Virtual widgets (composition) |
| --- | --- | --- |
| Lines of code | ~600 (single file) | ~150 (orchestration) + existing connectors |
| Per-facet-type logic | Reimplemented inline | Delegated to standalone connectors |
| SFFV support | Not implemented | Available via virtual widget (needs render wrapper) |
| sendEvent / Insights | Not implemented | Available via virtual widget |
| Maintenance burden | High (N copies of refinement logic) | Low (one factory + normalization) |
| Performance | Slightly better (no object allocation per facet) | Slightly worse (N virtual objects), but negligible |
| Complexity | All in one place (easy to read) | Split across factory + connectors (requires understanding the pattern) |

### Recommendation

Phase 1 (current PoC) ships the monolithic implementation to validate the architecture and gather feedback. Phase 2 refactors to virtual widget composition, which is the sustainable path for supporting all facet types without duplication. The `FacetSlice` render state type stays the same — only the internals change.

## Implementation lessons from PoC

The working PoC revealed several non-obvious issues:

### 1. `getFacetValues()` returns `undefined`, not throws

When a facet is not registered, `getFacetValues()` returns `undefined` — it does NOT throw. Early code had the raw fallback in `catch` blocks that were never reached.

### 2. `getWidgetSearchParameters` is not re-invoked after render

Only called during `addWidgets`/`init`. The `render()` method must directly modify `helper.state` and call `scheduleSearch()` to register facets discovered from `facetOrdering`.

### 3. Duplicate facet registration throws

The helper throws on duplicate `addHierarchicalFacet()` or `addHierarchicalFacetRefinement()`. Guards (`isHierarchicalFacet()`, `removeHierarchicalFacetRefinement()` before add) are required.

### 4. `facets: ['*']` does not register hierarchical facets

`facets: ['*']` makes all attributes available in the raw response as flat facets, but does NOT register them as hierarchical. `getFacetValues()` only works for explicitly registered facets. This is why the raw fallback reads `results._rawResults[0].facets[attribute]`.

### 5. Menu uses hierarchical facets internally

Must be registered with `addHierarchicalFacet({ name: attr, attributes: [attr] })`. `getFacetValues()` returns `{ data: [...] }` (tree), not a flat array.

### 6. Helper item format ≠ public API format

Helper returns `{ name, escapedValue, path }`. UI components expect `{ label, value }`. Recursive transformation is required.

## Breaking Changes

- **`fallbackComponent` signature** is richer (additive — `attribute` prop still present).
- **UI state ownership conflict** if standalone widget + connector manage same attribute. Mitigation: explicit children win.
- **No removal** of existing `connectDynamicWidgets` or `<DynamicWidgets>`.

## Migration Path

1. **Phase 1 (current PoC):** New connector + hook + component alongside existing ones.
2. **Phase 2:** Add `searchForFacetValues`, `numericMenu`/`range`/`ratingMenu` support. Export UI components publicly. Add Vue/vanilla JS adapters.
3. **Phase 3 (next major):** Deprecate `connectDynamicWidgets`.
4. **Phase 4 (major+1):** Remove old connector. Explicit children become syntactic sugar.

## Performance

| Scenario   | v1                          | v2                    |
| ---------- | --------------------------- | --------------------- |
| 10 facets  | ~10 widgets, 10 param calls | 1 widget, 1 bulk call |
| 50 facets  | ~50 widgets, noticeable lag | 1 widget, interactive |
| 200 facets | severe slowdown / crash     | 1 widget, fast        |
| 500 facets | not feasible                | 1 widget, DOM-bound   |

## Open Questions

1. **Can we avoid the two-search bootstrap?** If attributes are known upfront (e.g., `knownFacets: string[]`), yes.
2. **`searchForFacetValues` support?** Needs per-attribute search state + debouncing.
3. **Should UI components be publicly exported?** The unified rendering API (§4) requires built-in renderers to wrap `RefinementListUi`/`MenuUi`/`HierarchicalMenuUi`. These are currently internal to `react-instantsearch`. Shipping `DynamicWidgetsV2` with built-in renderers means either (a) making the Ui components public exports, or (b) bundling thin wrappers that re-implement the same markup. Option (a) is cleaner and helps the ecosystem.

## PoC file inventory

### Monolithic PoC (reimplements facet logic inline)

| File | Purpose |
| --- | --- |
| `packages/instantsearch.js/src/connectors/dynamic-facets/connectDynamicFacets.ts` | Core connector (~988 lines) |
| `packages/react-instantsearch-core/src/connectors/useDynamicFacets.ts` | React hook wrapping connector via `useConnector` |
| `packages/react-instantsearch-core/src/components/DynamicWidgetsV2.tsx` | React component (renders `fallbackComponent` per attribute) |

### Composed PoC (delegates to virtual standalone connector instances)

| File | Purpose |
| --- | --- |
| `packages/instantsearch.js/src/connectors/dynamic-facets-composed/connectDynamicFacetsComposed.ts` | Composed connector (~589 lines) — creates virtual widgets for each facet |
| `packages/react-instantsearch-core/src/connectors/useDynamicFacetsComposed.ts` | React hook wrapping composed connector |
| `packages/react-instantsearch-core/src/components/DynamicWidgetsV2Composed.tsx` | React component (same pattern as monolithic) |

### Barrel exports (modified existing files)

| File | Change |
| --- | --- |
| `packages/instantsearch.js/src/connectors/index.ts` | Added exports for both connectors |
| `packages/react-instantsearch-core/src/index.ts` | Added exports for hooks, components, and prop types |

### Example app

| File | Purpose |
| --- | --- |
| `examples/react/dynamic-widgets-v2/` | Working Vite example with 3-mode comparison (V2 monolithic, V2 composed, V1) |
| `examples/react/dynamic-widgets-v2/seed-index.mjs` | Script to create an Algolia index with 1000+ facet attributes |
| `examples/react/dynamic-widgets-v2/src/App.tsx` | Demo app using seeded index `dynamic_facets_v2_poc` |

## References

- `packages/instantsearch.js/src/connectors/dynamic-widgets/connectDynamicWidgets.ts`
- `packages/instantsearch.js/src/types/widget.ts`
- `packages/instantsearch.js/src/widgets/index/index.ts`
- `packages/react-instantsearch-core/src/hooks/useConnector.ts`
- `packages/algoliasearch-helper/src/SearchResults/index.js` — `getFacetValues`
- `packages/algoliasearch-helper/src/SearchResults/generate-hierarchical-tree.js`
- `connectHierarchicalMenu._prepareFacetValues` — reference for tree transformation
