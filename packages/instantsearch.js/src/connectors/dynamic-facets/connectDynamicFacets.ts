/**
 * connectDynamicFacets — PoC connector for DynamicWidgets v2.
 *
 * One widget manages ALL dynamic facets: registers search parameters,
 * computes render state, and dispatches refinement actions for every
 * attribute returned by facetOrdering.
 */
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';

import type {
  Connector,
  TransformItems,
  TransformItemsMetadata,
} from '../../types';
import type { SearchResults } from 'algoliasearch-helper';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-facets',
  connector: true,
});

// ---------------------------------------------------------------------------
// Widget descriptor types (the public API for choosing facet behaviour)
// ---------------------------------------------------------------------------

export type RefinementListDescriptor = {
  type: 'refinementList';
  operator?: 'and' | 'or';
  limit?: number;
  showMoreLimit?: number;
  searchable?: boolean;
  /** Per-attribute component override (React-level, opaque at connector level) */
  component?: any;
};

export type MenuDescriptor = {
  type: 'menu';
  limit?: number;
  showMoreLimit?: number;
  component?: any;
};

export type HierarchicalMenuDescriptor = {
  type: 'hierarchicalMenu';
  attributes: string[];
  separator?: string;
  rootPath?: string | null;
  showParentLevel?: boolean;
  limit?: number;
  showMoreLimit?: number;
  component?: any;
};

export type ToggleRefinementDescriptor = {
  type: 'toggleRefinement';
  on?: string | string[] | boolean;
  off?: string | string[] | boolean;
  component?: any;
};

export type NumericMenuDescriptor = {
  type: 'numericMenu';
  items: Array<{ label: string; start?: number; end?: number }>;
  component?: any;
};

export type RangeDescriptor = {
  type: 'range';
  min?: number;
  max?: number;
  precision?: number;
  component?: any;
};

export type RatingMenuDescriptor = {
  type: 'ratingMenu';
  max?: number;
  component?: any;
};

export type WidgetDescriptor =
  | RefinementListDescriptor
  | MenuDescriptor
  | HierarchicalMenuDescriptor
  | ToggleRefinementDescriptor
  | NumericMenuDescriptor
  | RangeDescriptor
  | RatingMenuDescriptor;

// ---------------------------------------------------------------------------
// Facet slice types (per-attribute render state)
// ---------------------------------------------------------------------------

export type RefinementListItem = {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
  highlighted?: string;
};

export type HierarchicalMenuItem = {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
  data: HierarchicalMenuItem[] | null;
};

export type FacetSlice = {
  type: WidgetDescriptor['type'];
  attribute: string;
  items: RefinementListItem[];
  /** For hierarchical menu slices, this contains the nested tree */
  hierarchicalItems?: HierarchicalMenuItem[];
  canRefine: boolean;
  isShowingMore: boolean;
  canToggleShowMore: boolean;
  hasExhaustiveItems: boolean;
  /** Per-attribute component from the descriptor (opaque at connector level, used by framework adapters) */
  descriptorComponent?: any;
};

// ---------------------------------------------------------------------------
// Connector params & render state
// ---------------------------------------------------------------------------

export type DynamicFacetsConnectorParams = {
  /**
   * Maps an attribute from facetOrdering to a widget descriptor.
   * Called for each attribute. Return `false` to skip.
   */
  widgets: (attribute: string) => WidgetDescriptor | false;

  facets?: ['*'] | string[];
  maxValuesPerFacet?: number;

  transformItems?: TransformItems<
    string,
    Omit<TransformItemsMetadata, 'results'> & {
      results: NonNullable<TransformItemsMetadata['results']>;
    }
  >;
};

export type DynamicFacetsRenderState = {
  attributesToRender: string[];
  facets: Record<string, FacetSlice>;
  refine: (attribute: string, value: string) => void;
  toggleShowMore: (attribute: string) => void;
  createURL: (attribute: string, value: string) => string;
};

export type DynamicFacetsWidgetDescription = {
  $$type: 'ais.dynamicFacets';
  renderState: DynamicFacetsRenderState;
  indexRenderState: {
    dynamicFacets: DynamicFacetsRenderState;
  };
  indexUiState: {
    refinementList?: Record<string, string[]>;
    menu?: Record<string, string>;
    hierarchicalMenu?: Record<string, string[]>;
    toggle?: Record<string, boolean>;
    numericMenu?: Record<string, string>;
    range?: Record<string, string>;
    ratingMenu?: Record<string, number>;
  };
};

export type DynamicFacetsConnector = Connector<
  DynamicFacetsWidgetDescription,
  DynamicFacetsConnectorParams
>;

// ---------------------------------------------------------------------------
// Helper: resolve widget descriptor for an attribute
// ---------------------------------------------------------------------------

function resolveDescriptor(
  widgetsFn: DynamicFacetsConnectorParams['widgets'],
  attribute: string
): WidgetDescriptor | null {
  const desc = widgetsFn(attribute);
  if (desc === false) return null;
  return desc;
}

// ---------------------------------------------------------------------------
// Helper: transform raw hierarchical facet data from the helper into
// the HierarchicalMenuItem shape the UI components expect.
// The helper returns { name, escapedValue, path, count, isRefined, data }
// but our public API uses { label, value, count, isRefined, data }.
// ---------------------------------------------------------------------------

function prepareHierarchicalItems(
  facetValues: any[],
  limit?: number
): HierarchicalMenuItem[] {
  const sliced =
    limit !== null || limit !== undefined
      ? facetValues.slice(0, limit)
      : facetValues;
  return sliced.map(({ name, escapedValue, data, path, ...rest }: any) => ({
    ...rest,
    label: String(name),
    value: String(escapedValue ?? path ?? name),
    data: Array.isArray(data) ? prepareHierarchicalItems(data) : null,
  }));
}

// ---------------------------------------------------------------------------
// The connector
// ---------------------------------------------------------------------------

const connectDynamicFacets: DynamicFacetsConnector =
  function connectDynamicFacets(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        widgets: widgetsFn,
        maxValuesPerFacet = 20,
        facets = ['*'],
        transformItems = ((items: string[]) => items) as NonNullable<
          DynamicFacetsConnectorParams['transformItems']
        >,
      } = widgetParams;

      if (typeof widgetsFn !== 'function') {
        throw new Error(withUsage('The `widgets` option expects a function.'));
      }

      // Per-attribute showMore state (client-side only)
      const showMoreState = new Map<string, boolean>();

      // Resolved descriptors cache (cleared on each render)
      let resolvedDescriptors = new Map<string, WidgetDescriptor>();

      // Attributes discovered from facetOrdering on the last render.
      // Used by getWidgetSearchParameters to register them as proper
      // disjunctive/conjunctive facets so that getFacetValues() works.
      let knownAttributes: string[] = [];

      return {
        $$type: 'ais.dynamicFacets' as const,

        init(initOptions) {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance: initOptions.instantSearchInstance,
            },
            true
          );
        },

        // eslint-disable-next-line complexity
        render(renderOptions) {
          const renderState = this.getWidgetRenderState(renderOptions);

          // After the first search, knownAttributes is populated from
          // facetOrdering. Some facet types (menu, hierarchicalMenu)
          // need explicit registration as hierarchical facets in the
          // helper state so that getFacetValues() returns the proper
          // tree data. If they aren't registered yet, update the
          // helper state and schedule a fresh search.
          const { helper } = renderOptions;
          if (helper && knownAttributes.length > 0) {
            let needsReSearch = false;
            let params = helper.state;

            // eslint-disable-next-line no-restricted-syntax
            for (const attr of knownAttributes) {
              const desc = resolveDescriptor(widgetsFn, attr);
              // eslint-disable-next-line no-continue
              if (!desc) continue;

              switch (desc.type) {
                case 'menu': {
                  if (!params.isHierarchicalFacet(attr)) {
                    params = params.addHierarchicalFacet({
                      name: attr,
                      attributes: [attr],
                    });
                    needsReSearch = true;
                  }
                  break;
                }
                case 'hierarchicalMenu': {
                  const hierDesc = desc;
                  const hierName = hierDesc.attributes[0];
                  if (!params.isHierarchicalFacet(hierName)) {
                    params = params.addHierarchicalFacet({
                      name: hierName,
                      attributes: hierDesc.attributes,
                      separator: hierDesc.separator ?? ' > ',
                      rootPath: hierDesc.rootPath ?? null,
                      showParentLevel: hierDesc.showParentLevel ?? true,
                    });
                    needsReSearch = true;
                  }
                  break;
                }
                case 'refinementList': {
                  const isDisjunctive = (desc.operator ?? 'or') === 'or';
                  if (isDisjunctive && !params.isDisjunctiveFacet(attr)) {
                    params = params.addDisjunctiveFacet(attr);
                    needsReSearch = true;
                  } else if (
                    !isDisjunctive &&
                    !params.isConjunctiveFacet(attr)
                  ) {
                    params = params.addFacet(attr);
                    needsReSearch = true;
                  }
                  break;
                }
                case 'toggleRefinement': {
                  if (!params.isDisjunctiveFacet(attr)) {
                    params = params.addDisjunctiveFacet(attr);
                    needsReSearch = true;
                  }
                  break;
                }
                default:
                  break;
              }
            }

            if (needsReSearch) {
              helper.setState(params);
              renderOptions.instantSearchInstance.scheduleSearch();
            }
          }

          renderFn(
            {
              ...renderState,
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
        },

        dispose() {
          unmountFn();
        },

        // ---------------------------------------------------------------
        // Search parameters: register facets for ALL managed attributes
        // This is the key perf win — ONE call instead of N.
        // ---------------------------------------------------------------
        // eslint-disable-next-line complexity
        getWidgetSearchParameters(searchParameters, { uiState }) {
          let params = searchParameters;

          // Global facet request
          // eslint-disable-next-line no-restricted-syntax
          for (const facet of facets) {
            params = params.addFacet(facet);
          }

          params = params.setQueryParameter(
            'maxValuesPerFacet',
            Math.max(maxValuesPerFacet || 0, params.maxValuesPerFacet || 0)
          );

          // Register all known attributes (discovered from the previous
          // render's facetOrdering) so the helper processes them properly
          // and getFacetValues() works.
          // Also register any attributes with active refinements from uiState.
          const attributesToRegister = new Set<string>(knownAttributes);

          const rl = uiState.refinementList || {};
          for (const attr of Object.keys(rl)) {
            if (rl[attr]?.length) attributesToRegister.add(attr);
          }

          const menu = uiState.menu || {};
          for (const attr of Object.keys(menu)) {
            if (menu[attr]) attributesToRegister.add(attr);
          }

          const toggle = uiState.toggle || {};
          for (const attr of Object.keys(toggle)) {
            if (toggle[attr]) attributesToRegister.add(attr);
          }

          for (const attribute of attributesToRegister) {
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;

            // Skip if attribute is already registered in any facet type
            const alreadyRegistered =
              params.isHierarchicalFacet(attribute) ||
              params.isDisjunctiveFacet(attribute) ||
              params.isConjunctiveFacet(attribute);

            switch (desc.type) {
              case 'refinementList': {
                const isDisjunctive = (desc.operator ?? 'or') === 'or';
                const values = uiState.refinementList?.[attribute];
                if (!alreadyRegistered) {
                  if (isDisjunctive) {
                    params = params.addDisjunctiveFacet(attribute);
                  } else {
                    params = params.addFacet(attribute);
                  }
                }
                if (values) {
                  for (const v of values) {
                    if (isDisjunctive) {
                      params = params.addDisjunctiveFacetRefinement(
                        attribute,
                        v
                      );
                    } else {
                      params = params.addFacetRefinement(attribute, v);
                    }
                  }
                }
                break;
              }
              case 'menu': {
                if (!alreadyRegistered) {
                  params = params.addHierarchicalFacet({
                    name: attribute,
                    attributes: [attribute],
                  });
                }
                const menuValue = uiState.menu?.[attribute];
                if (menuValue) {
                  // Clear any existing refinement first (throws if already refined)
                  params = params
                    .removeHierarchicalFacetRefinement(attribute)
                    .addHierarchicalFacetRefinement(attribute, menuValue);
                }
                break;
              }
              case 'hierarchicalMenu': {
                const hierDesc = desc as HierarchicalMenuDescriptor;
                const hierName = hierDesc.attributes[0];
                const hierAlreadyRegistered =
                  params.isHierarchicalFacet(hierName) ||
                  params.isDisjunctiveFacet(hierName) ||
                  params.isConjunctiveFacet(hierName);
                if (!hierAlreadyRegistered) {
                  params = params.addHierarchicalFacet({
                    name: hierName,
                    attributes: hierDesc.attributes,
                    separator: hierDesc.separator ?? ' > ',
                    rootPath: hierDesc.rootPath ?? null,
                    showParentLevel:
                      hierDesc.showParentLevel !== undefined
                        ? hierDesc.showParentLevel
                        : true,
                  });
                }
                const hierValue = uiState.hierarchicalMenu?.[hierName];
                if (hierValue && hierValue.length) {
                  // Clear any existing refinement first
                  params = params
                    .removeHierarchicalFacetRefinement(hierName)
                    .addHierarchicalFacetRefinement(
                      hierName,
                      hierValue.join(hierDesc.separator ?? ' > ')
                    );
                }
                break;
              }
              case 'toggleRefinement': {
                if (!alreadyRegistered) {
                  params = params.addDisjunctiveFacet(attribute);
                }
                const isRefined = uiState.toggle?.[attribute];
                if (isRefined && desc.on) {
                  const vals = Array.isArray(desc.on)
                    ? desc.on
                    : [String(desc.on)];
                  for (const v of vals) {
                    params = params.addDisjunctiveFacetRefinement(attribute, v);
                  }
                }
                break;
              }
              default:
                break;
            }
          }

          return params;
        },

        // ---------------------------------------------------------------
        // UI state: read refinements back from search parameters
        // Scans ALL refinements in searchParameters that this widget
        // manages (i.e. widgetsFn returns a descriptor for them).
        // This is critical for routing: the router calls getWidgetUiState
        // on every helper state change, which can happen before
        // getWidgetRenderState has populated resolvedDescriptors.
        // ---------------------------------------------------------------
        getWidgetUiState(uiState, { searchParameters }) {
          const result = { ...uiState };

          // Collect all attributes that have refinements in searchParameters
          // and that this widget manages.

          // 1) Disjunctive facet refinements → refinementList or toggle
          const disjunctiveFacets = searchParameters.disjunctiveFacets || [];
          for (const attribute of disjunctiveFacets) {
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;

            const refinements =
              searchParameters.getDisjunctiveRefinements(attribute);
            if (!refinements.length) continue;

            if (desc.type === 'toggleRefinement') {
              result.toggle = {
                ...result.toggle,
                [attribute]: true,
              };
            } else {
              // refinementList (disjunctive)
              result.refinementList = {
                ...result.refinementList,
                [attribute]: refinements,
              };
            }
          }

          // 2) Conjunctive facet refinements → refinementList (and)
          const conjunctiveFacets = searchParameters.facets || [];
          for (const attribute of conjunctiveFacets) {
            // Skip the wildcard '*' facet
            if (attribute === '*') continue;

            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;

            const refinements =
              searchParameters.getConjunctiveRefinements(attribute);
            if (!refinements.length) continue;

            result.refinementList = {
              ...result.refinementList,
              [attribute]: refinements,
            };
          }

          // 3) Hierarchical facet refinements → menu or hierarchicalMenu
          const hierarchicalFacets = searchParameters.hierarchicalFacets || [];
          for (const hf of hierarchicalFacets) {
            const attribute = typeof hf === 'string' ? hf : hf.name;
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;

            try {
              const hier =
                searchParameters.getHierarchicalRefinement(attribute);
              if (hier.length) {
                if (desc.type === 'menu') {
                  result.menu = {
                    ...result.menu,
                    [attribute]: hier[0],
                  };
                } else if (desc.type === 'hierarchicalMenu') {
                  const separator =
                    (desc as HierarchicalMenuDescriptor).separator ?? ' > ';
                  result.hierarchicalMenu = {
                    ...result.hierarchicalMenu,
                    [attribute]: hier[0].split(separator),
                  };
                }
              }
            } catch {
              // not registered yet
            }
          }

          return result;
        },

        // ---------------------------------------------------------------
        // Render state: one loop, all attributes
        // ---------------------------------------------------------------
        getRenderState(renderState, renderOptions) {
          return {
            ...renderState,
            dynamicFacets: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState({ results, state, helper, createURL }) {
          if (!results) {
            return {
              attributesToRender: [],
              facets: {},
              refine: () => {},
              toggleShowMore: () => {},
              createURL: () => '',
              widgetParams,
            };
          }

          // Determine which attributes to render from facetOrdering
          const attributesToRender = transformItems(
            results.renderingContent?.facetOrdering?.facets?.order ?? [],
            { results }
          );

          // Cache for next getWidgetSearchParameters call so the helper
          // registers these as proper facets on the next search cycle.
          knownAttributes = attributesToRender;

          warning(
            maxValuesPerFacet >= (state.maxValuesPerFacet || 0),
            `The maxValuesPerFacet set by dynamic facets (${maxValuesPerFacet}) is smaller than one of the limits set by a widget (${state.maxValuesPerFacet}).`
          );

          // Resolve descriptors and build facet slices in ONE loop
          resolvedDescriptors = new Map();
          const facetSlices: Record<string, FacetSlice> = {};

          for (const attribute of attributesToRender) {
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;

            resolvedDescriptors.set(attribute, desc);

            const isShowingMore = showMoreState.get(attribute) ?? false;

            let items: RefinementListItem[] = [];
            let hierarchicalItems: HierarchicalMenuItem[] | undefined;
            let hasExhaustiveItems = true;

            // ----- Hierarchical menu -----
            if (desc.type === 'hierarchicalMenu') {
              const hierDesc = desc as HierarchicalMenuDescriptor;
              const hierName = hierDesc.attributes[0];

              // getFacetValues returns undefined if not registered yet
              let hierFacetValues: ReturnType<SearchResults['getFacetValues']>;
              try {
                hierFacetValues = results.getFacetValues(hierName, {
                  sortBy: ['isRefined:desc', 'count:desc', 'name:asc'],
                  facetOrdering: true,
                });
              } catch {
                // ignore
              }

              if (
                hierFacetValues &&
                !Array.isArray(hierFacetValues) &&
                hierFacetValues.data
              ) {
                hierarchicalItems = prepareHierarchicalItems(
                  hierFacetValues.data
                );
              } else {
                // Raw fallback: build flat list from raw API response
                const rawFacets = (results as any)._rawResults?.[0]?.facets?.[
                  hierName
                ];

                if (rawFacets && typeof rawFacets === 'object') {
                  hierarchicalItems = Object.entries(
                    rawFacets as Record<string, number>
                  )
                    .map(([name, count]) => ({
                      value: name,
                      label: name,
                      count: count as number,
                      isRefined: false,
                      data: null,
                    }))
                    .sort((a, b) => b.count - a.count);
                }
              }

              facetSlices[attribute] = {
                type: desc.type,
                attribute,
                items: [],
                hierarchicalItems: hierarchicalItems ?? [],
                canRefine: (hierarchicalItems ?? []).length > 0,
                isShowingMore,
                canToggleShowMore: false,
                hasExhaustiveItems: true,
                descriptorComponent: desc.component,
              };
              continue;
            }

            // ----- Menu (uses hierarchical facet internally, single-select) -----
            if (desc.type === 'menu') {
              const limit = desc.limit ?? 10;
              const showMoreLimit = desc.showMoreLimit ?? limit;
              const currentLimit = isShowingMore ? showMoreLimit : limit;

              // getFacetValues returns undefined if not registered yet
              let menuFacetValues: ReturnType<SearchResults['getFacetValues']>;
              try {
                menuFacetValues = results.getFacetValues(attribute, {
                  sortBy: ['isRefined:desc', 'count:desc', 'name:asc'],
                  facetOrdering: true,
                });
              } catch {
                // ignore
              }

              // Menu is registered as hierarchical, so getFacetValues
              // returns a tree { data: [...] }, not a flat array.
              if (
                menuFacetValues &&
                !Array.isArray(menuFacetValues) &&
                menuFacetValues.data
              ) {
                const facetItems = menuFacetValues.data;
                items = facetItems.slice(0, currentLimit).map((v: any) => ({
                  value: String(v.escapedValue ?? v.path ?? v.name),
                  label: String(v.name),
                  count: v.count,
                  isRefined: v.isRefined,
                }));
                hasExhaustiveItems = facetItems.length <= currentLimit;
              } else {
                // Raw fallback: read from raw API response (flat facet data)
                const rawFacets = (results as any)._rawResults?.[0]?.facets?.[
                  attribute
                ];

                if (rawFacets && typeof rawFacets === 'object') {
                  const rawValues = Object.entries(
                    rawFacets as Record<string, number>
                  )
                    .map(([name, count]) => ({
                      name,
                      count: count as number,
                      isRefined: false,
                    }))
                    .sort((a, b) => b.count - a.count);

                  items = rawValues.slice(0, currentLimit).map((v) => ({
                    value: String(v.name),
                    label: String(v.name),
                    count: v.count,
                    isRefined: v.isRefined,
                  }));
                  hasExhaustiveItems = rawValues.length <= currentLimit;
                }
              }

              const canToggleShowMore =
                (desc.showMoreLimit ?? 0) > (desc.limit ?? 10) &&
                (isShowingMore || !hasExhaustiveItems);

              facetSlices[attribute] = {
                type: desc.type,
                attribute,
                items,
                canRefine: items.length > 0,
                isShowingMore,
                canToggleShowMore,
                hasExhaustiveItems,
                descriptorComponent: desc.component,
              };
              continue;
            }

            // ----- refinementList / ratingMenu -----
            if (desc.type === 'refinementList' || desc.type === 'ratingMenu') {
              const limit =
                desc.type === 'refinementList' ? desc.limit ?? 10 : 5;
              const showMoreLimit =
                desc.type === 'refinementList'
                  ? desc.showMoreLimit ?? limit
                  : limit;
              const currentLimit = isShowingMore ? showMoreLimit : limit;

              let rawValues: Array<{
                name: string;
                count: number;
                isRefined: boolean;
              }> = [];

              try {
                const values = results.getFacetValues(attribute, {
                  sortBy: ['isRefined:desc', 'count:desc', 'name:asc'],
                  facetOrdering: true,
                });

                if (values && Array.isArray(values)) {
                  rawValues = values as Array<{
                    name: string;
                    count: number;
                    isRefined: boolean;
                  }>;
                }
              } catch {
                // attribute not registered in the helper yet
              }

              // Fallback: read directly from raw API response
              if (rawValues.length === 0) {
                const rawFacets =
                  (results as any)._rawResults?.[0]?.facets?.[attribute] ??
                  (results as any).facets?.find?.(
                    (f: any) => f.name === attribute
                  )?.data;

                if (rawFacets && typeof rawFacets === 'object') {
                  rawValues = Object.entries(
                    rawFacets as Record<string, number>
                  )
                    .map(([name, count]) => ({
                      name,
                      count: count as number,
                      isRefined: false,
                    }))
                    .sort((a, b) => b.count - a.count);
                }
              }

              items = rawValues.slice(0, currentLimit).map((v) => ({
                value: String(v.name),
                label: String(v.name),
                count: v.count,
                isRefined: v.isRefined,
              }));

              hasExhaustiveItems = rawValues.length <= currentLimit;
            }

            const canToggleShowMore =
              desc.type === 'refinementList' &&
              (desc.showMoreLimit ?? 0) > (desc.limit ?? 10) &&
              (isShowingMore || !hasExhaustiveItems);

            facetSlices[attribute] = {
              type: desc.type,
              attribute,
              items,
              canRefine: items.length > 0,
              isShowingMore,
              canToggleShowMore,
              hasExhaustiveItems,
              descriptorComponent: desc.component,
            };
          }

          // Centralized refine action
          const refine = (attribute: string, value: string) => {
            if (!helper) return;
            const desc = resolvedDescriptors.get(attribute);
            if (!desc) return;

            // Ensure the facet is registered in the helper state before
            // attempting to toggle it. On the first interaction the
            // helper may not yet have the attribute registered.
            const ensureDisjunctive = (attr: string) => {
              if (
                !helper.state.isDisjunctiveFacet(attr) &&
                !helper.state.isConjunctiveFacet(attr) &&
                !helper.state.isHierarchicalFacet(attr)
              ) {
                helper.setState(helper.state.addDisjunctiveFacet(attr));
              }
            };

            switch (desc.type) {
              case 'refinementList': {
                const isDisjunctive = (desc.operator ?? 'or') === 'or';
                if (isDisjunctive) {
                  ensureDisjunctive(attribute);
                  helper.toggleFacetRefinement(attribute, value).search();
                } else {
                  if (!helper.state.isConjunctiveFacet(attribute)) {
                    helper.setState(helper.state.addFacet(attribute));
                  }
                  helper.toggleFacetRefinement(attribute, value).search();
                }
                break;
              }
              case 'menu': {
                try {
                  if (!helper.state.isHierarchicalFacet(attribute)) {
                    helper.setState(
                      helper.state.addHierarchicalFacet({
                        name: attribute,
                        attributes: [attribute],
                      })
                    );
                  }
                  const current =
                    helper.getHierarchicalFacetBreadcrumb(attribute);
                  if (current[0] === value) {
                    helper
                      .removeHierarchicalFacetRefinement(attribute)
                      .search();
                  } else {
                    helper
                      .removeHierarchicalFacetRefinement(attribute)
                      .addHierarchicalFacetRefinement(attribute, value)
                      .search();
                  }
                } catch {
                  ensureDisjunctive(attribute);
                  helper.toggleFacetRefinement(attribute, value).search();
                }
                break;
              }
              case 'hierarchicalMenu': {
                const hierDesc = desc as HierarchicalMenuDescriptor;
                const hierName = hierDesc.attributes[0];
                try {
                  if (!helper.state.isHierarchicalFacet(hierName)) {
                    helper.setState(
                      helper.state.addHierarchicalFacet({
                        name: hierName,
                        attributes: hierDesc.attributes,
                        separator: hierDesc.separator ?? ' > ',
                        rootPath: hierDesc.rootPath ?? null,
                        showParentLevel:
                          hierDesc.showParentLevel !== undefined
                            ? hierDesc.showParentLevel
                            : true,
                      })
                    );
                  }
                  helper.toggleFacetRefinement(hierName, value).search();
                } catch {
                  // fallback
                }
                break;
              }
              case 'toggleRefinement': {
                ensureDisjunctive(attribute);
                helper.toggleFacetRefinement(attribute, value).search();
                break;
              }
              default: {
                ensureDisjunctive(attribute);
                helper.toggleFacetRefinement(attribute, value).search();
                break;
              }
            }
          };

          // Centralized showMore toggle
          const toggleShowMore = (attribute: string) => {
            const current = showMoreState.get(attribute) ?? false;
            showMoreState.set(attribute, !current);
            // Trigger re-render
            renderFn(
              {
                ...this.getWidgetRenderState({
                  results,
                  state,
                  helper,
                  createURL,
                } as any),
                instantSearchInstance: (helper as any)
                  ._lastDerivedHelperSearchParameters?.instantSearchInstance,
              },
              false
            );
          };

          // Centralized createURL
          const createURLFn = (attribute: string, value: string) => {
            if (!createURL) return '#';
            return createURL((uiState: any) => {
              const refinementList = {
                ...(uiState.refinementList || {}),
              };
              const current = refinementList[attribute] || [];
              if (current.includes(value)) {
                refinementList[attribute] = current.filter(
                  (v: string) => v !== value
                );
              } else {
                refinementList[attribute] = [...current, value];
              }
              return { ...uiState, refinementList };
            });
          };

          return {
            attributesToRender,
            facets: facetSlices,
            refine,
            toggleShowMore,
            createURL: createURLFn,
            widgetParams,
          };
        },
      };
    };
  };

export default connectDynamicFacets;
