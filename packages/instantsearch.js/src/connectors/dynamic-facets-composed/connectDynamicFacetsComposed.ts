/**
 * connectDynamicFacetsComposed — PoC connector for DynamicWidgets v2
 * using virtual (never-mounted) widget instances from the standalone
 * connectors instead of reimplementing their logic.
 *
 * One widget manages ALL dynamic facets by:
 *  1. Delegating getWidgetSearchParameters to virtual widgets
 *  2. Delegating getWidgetRenderState to virtual widgets
 *  3. Delegating getWidgetUiState to virtual widgets
 *  4. Normalizing the heterogeneous render states into FacetSlice
 */
import {
  checkRendering,
  createDocumentationMessageGenerator,
  noop,
  warning,
} from '../../lib/utils';

import connectHierarchicalMenu from '../hierarchical-menu/connectHierarchicalMenu';
import connectMenu from '../menu/connectMenu';
import connectRefinementList from '../refinement-list/connectRefinementList';
import connectToggleRefinement from '../toggle-refinement/connectToggleRefinement';

import type {
  Connector,
  TransformItems,
  TransformItemsMetadata,
  Widget,
} from '../../types';
import type { HierarchicalMenuItem } from '../hierarchical-menu/connectHierarchicalMenu';

// Re-export descriptor types from the monolithic connector for compatibility
export type {
  WidgetDescriptor,
  RefinementListDescriptor,
  MenuDescriptor,
  HierarchicalMenuDescriptor,
  ToggleRefinementDescriptor,
  NumericMenuDescriptor,
  RangeDescriptor,
  RatingMenuDescriptor,
} from '../dynamic-facets/connectDynamicFacets';

import type { WidgetDescriptor } from '../dynamic-facets/connectDynamicFacets';

const withUsage = createDocumentationMessageGenerator({
  name: 'dynamic-facets-composed',
  connector: true,
});

// ---------------------------------------------------------------------------
// Facet slice types — identical to the monolithic connector
// ---------------------------------------------------------------------------

export type RefinementListItem = {
  value: string;
  label: string;
  count: number;
  isRefined: boolean;
  highlighted?: string;
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

export type DynamicFacetsComposedConnectorParams = {
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

export type DynamicFacetsComposedRenderState = {
  attributesToRender: string[];
  facets: Record<string, FacetSlice>;
  refine: (attribute: string, value: string) => void;
  toggleShowMore: (attribute: string) => void;
  createURL: (attribute: string, value: string) => string;
};

export type DynamicFacetsComposedWidgetDescription = {
  $$type: 'ais.dynamicFacetsComposed';
  renderState: DynamicFacetsComposedRenderState;
  indexRenderState: {
    dynamicFacets: DynamicFacetsComposedRenderState;
  };
  indexUiState: {
    refinementList?: Record<string, string[]>;
    menu?: Record<string, string>;
    hierarchicalMenu?: Record<string, string[]>;
    toggle?: Record<string, boolean>;
  };
};

export type DynamicFacetsComposedConnector = Connector<
  DynamicFacetsComposedWidgetDescription,
  DynamicFacetsComposedConnectorParams
>;

// ---------------------------------------------------------------------------
// Helper: resolve widget descriptor
// ---------------------------------------------------------------------------

function resolveDescriptor(
  widgetsFn: DynamicFacetsComposedConnectorParams['widgets'],
  attribute: string
): WidgetDescriptor | null {
  const desc = widgetsFn(attribute);
  if (desc === false) return null;
  return desc;
}

// ---------------------------------------------------------------------------
// The connector
// ---------------------------------------------------------------------------

const connectDynamicFacetsComposed: DynamicFacetsComposedConnector =
  function connectDynamicFacetsComposed(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const {
        widgets: widgetsFn,
        maxValuesPerFacet = 20,
        facets = ['*'],
        transformItems = ((items: string[]) => items) as NonNullable<
          DynamicFacetsComposedConnectorParams['transformItems']
        >,
      } = widgetParams;

      if (typeof widgetsFn !== 'function') {
        throw new Error(withUsage('The `widgets` option expects a function.'));
      }

      // ---------------------------------------------------------------
      // Virtual widget instances — keyed by attribute, created on demand
      // These are NEVER mounted in the Index widget tree; we only call
      // their getWidgetSearchParameters, getWidgetUiState, and
      // getWidgetRenderState methods directly.
      // ---------------------------------------------------------------
      const virtualWidgets = new Map<string, Widget>();

      // Cached render state per virtual widget (from last getWidgetRenderState)
      const cachedVirtualRenderStates = new Map<string, any>();

      // Attributes discovered from facetOrdering
      let knownAttributes: string[] = [];

      // Saved from last render() call for toggleShowMore re-render
      let lastRenderOptions: any = null;

      function getOrCreateVirtual(
        attribute: string,
        desc: WidgetDescriptor
      ): Widget {
        const existing = virtualWidgets.get(attribute);
        if (existing) return existing;

        let widget: Widget;
        switch (desc.type) {
          case 'refinementList': {
            const limit = desc.limit ?? 10;
            const showMoreLimit = desc.showMoreLimit ?? 20;
            widget = connectRefinementList(() => {})({
              attribute,
              operator: desc.operator ?? 'or',
              limit,
              showMore: showMoreLimit > limit,
              showMoreLimit,
            });
            break;
          }
          case 'menu': {
            const limit = desc.limit ?? 10;
            const showMoreLimit = desc.showMoreLimit ?? 20;
            widget = connectMenu(() => {})({
              attribute,
              limit,
              showMore: showMoreLimit > limit,
              showMoreLimit,
            });
            break;
          }
          case 'hierarchicalMenu': {
            const limit = desc.limit ?? 10;
            const showMoreLimit = desc.showMoreLimit ?? 20;
            widget = connectHierarchicalMenu(() => {})({
              attributes: desc.attributes,
              separator: desc.separator ?? ' > ',
              rootPath: desc.rootPath ?? null,
              showParentLevel: desc.showParentLevel ?? true,
              limit,
              showMore: showMoreLimit > limit,
              showMoreLimit,
            });
            break;
          }
          case 'toggleRefinement': {
            widget = connectToggleRefinement(() => {})({
              attribute,
              on: desc.on as any,
              off: desc.off as any,
            });
            break;
          }
          default:
            // For types not yet supported (numericMenu, range, ratingMenu),
            // fall back to refinementList
            widget = connectRefinementList(() => {})({
              attribute,
              limit: 10,
            });
            break;
        }

        virtualWidgets.set(attribute, widget);
        return widget;
      }

      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      const widgetObj = {
        $$type: 'ais.dynamicFacetsComposed' as const,

        init(initOptions: any) {
          renderFn(
            {
              ...this.getWidgetRenderState(initOptions),
              instantSearchInstance: initOptions.instantSearchInstance,
            },
            true
          );
        },

        render(renderOptions: any) {
          lastRenderOptions = renderOptions;
          const renderState = this.getWidgetRenderState(renderOptions);

          // -------------------------------------------------------
          // Two-search bootstrap: register facets discovered from
          // facetOrdering that weren't registered during init.
          // We directly modify helper.state (same as monolithic PoC)
          // because getWidgetSearchParameters is not re-invoked.
          // -------------------------------------------------------
          const { helper } = renderOptions;
          if (helper && knownAttributes.length > 0) {
            let needsReSearch = false;
            let params = helper.state;

            for (const attr of knownAttributes) {
              const desc = resolveDescriptor(widgetsFn, attr);
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
                  const hierName = desc.attributes[0];
                  if (!params.isHierarchicalFacet(hierName)) {
                    params = params.addHierarchicalFacet({
                      name: hierName,
                      attributes: desc.attributes,
                      separator: desc.separator ?? ' > ',
                      rootPath: desc.rootPath ?? null,
                      showParentLevel: desc.showParentLevel ?? true,
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
        // Search parameters: delegate to virtual widgets
        // This is where the composition shines — each virtual widget
        // handles its own facet registration, maxValuesPerFacet, and
        // uiState→refinement mapping.
        // ---------------------------------------------------------------
        getWidgetSearchParameters(searchParameters: any, { uiState }: any) {
          let params = searchParameters;

          // Global facet request for discovery
          for (const facet of facets) {
            if (!params.isConjunctiveFacet(facet)) {
              params = params.addFacet(facet);
            }
          }

          params = params.setQueryParameter(
            'maxValuesPerFacet',
            Math.max(maxValuesPerFacet || 0, params.maxValuesPerFacet || 0)
          );

          // Merge known + refined attributes from uiState
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
          const hierMenu = uiState.hierarchicalMenu || {};
          for (const attr of Object.keys(hierMenu)) {
            if (hierMenu[attr]?.length) attributesToRegister.add(attr);
          }

          // Delegate to each virtual widget's getWidgetSearchParameters
          for (const attribute of attributesToRegister) {
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;
            const vw = getOrCreateVirtual(attribute, desc);
            if (vw.getWidgetSearchParameters) {
              params = vw.getWidgetSearchParameters(params, { uiState });
            }
          }

          return params;
        },

        // ---------------------------------------------------------------
        // UI state: delegate to virtual widgets
        // ---------------------------------------------------------------
        getWidgetUiState(uiState: any, options: any) {
          let result = { ...uiState };

          for (const [, vw] of virtualWidgets) {
            if (vw.getWidgetUiState) {
              result = vw.getWidgetUiState(result, options);
            }
          }

          return result;
        },

        // ---------------------------------------------------------------
        // Render state: call each virtual widget, normalize to FacetSlice
        // ---------------------------------------------------------------
        getRenderState(renderState: any, renderOptions: any) {
          return {
            ...renderState,
            dynamicFacets: this.getWidgetRenderState(renderOptions),
          };
        },

        getWidgetRenderState(renderOptions: any) {
          const { results, state } = renderOptions;

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

          // Determine attributes from facetOrdering
          const attributesToRender = transformItems(
            results.renderingContent?.facetOrdering?.facets?.order ?? [],
            { results }
          );

          knownAttributes = attributesToRender;

          warning(
            maxValuesPerFacet >= (state.maxValuesPerFacet || 0),
            `The maxValuesPerFacet set by dynamic facets (${maxValuesPerFacet}) is smaller than one of the limits set by a widget (${state.maxValuesPerFacet}).`
          );

          // Build FacetSlice for each attribute by delegating to virtual widgets
          const facetSlices: Record<string, FacetSlice> = {};

          for (const attribute of attributesToRender) {
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) continue;

            const vw = getOrCreateVirtual(attribute, desc);

            // Call the virtual widget's getWidgetRenderState with our
            // real renderOptions — this lazily initializes refine, sendEvent,
            // createURL inside the virtual widget.
            const rs: any = vw.getWidgetRenderState!(renderOptions);

            // Cache for refine/toggleShowMore/createURL dispatching
            cachedVirtualRenderStates.set(attribute, rs);

            // Normalize per type into FacetSlice
            switch (desc.type) {
              case 'refinementList':
                facetSlices[attribute] = {
                  type: 'refinementList',
                  attribute,
                  items: rs.items ?? [],
                  canRefine: rs.canRefine ?? false,
                  isShowingMore: rs.isShowingMore ?? false,
                  canToggleShowMore: rs.canToggleShowMore ?? false,
                  hasExhaustiveItems: rs.hasExhaustiveItems ?? true,
                  descriptorComponent: desc.component,
                };
                break;
              case 'menu':
                facetSlices[attribute] = {
                  type: 'menu',
                  attribute,
                  items: rs.items ?? [],
                  canRefine: rs.canRefine ?? false,
                  isShowingMore: rs.isShowingMore ?? false,
                  canToggleShowMore: rs.canToggleShowMore ?? false,
                  hasExhaustiveItems: true,
                  descriptorComponent: desc.component,
                };
                break;
              case 'hierarchicalMenu':
                facetSlices[attribute] = {
                  type: 'hierarchicalMenu',
                  attribute,
                  items: [],
                  hierarchicalItems: rs.items ?? [],
                  canRefine: rs.canRefine ?? false,
                  isShowingMore: rs.isShowingMore ?? false,
                  canToggleShowMore: rs.canToggleShowMore ?? false,
                  hasExhaustiveItems: true,
                  descriptorComponent: desc.component,
                };
                break;
              case 'toggleRefinement':
                facetSlices[attribute] = {
                  type: 'toggleRefinement',
                  attribute,
                  items: [],
                  canRefine: rs.canRefine ?? false,
                  isShowingMore: false,
                  canToggleShowMore: false,
                  hasExhaustiveItems: true,
                  descriptorComponent: desc.component,
                };
                break;
              default:
                facetSlices[attribute] = {
                  type: desc.type,
                  attribute,
                  items: rs.items ?? [],
                  canRefine: rs.canRefine ?? false,
                  isShowingMore: rs.isShowingMore ?? false,
                  canToggleShowMore: rs.canToggleShowMore ?? false,
                  hasExhaustiveItems: rs.hasExhaustiveItems ?? true,
                  descriptorComponent: desc.component,
                };
                break;
            }
          }

          // Centralized refine — dispatch to virtual widget's own refine
          const refine = (attribute: string, value: string) => {
            const desc = resolveDescriptor(widgetsFn, attribute);
            if (!desc) return;

            const rs = cachedVirtualRenderStates.get(attribute);
            if (!rs?.refine) return;

            if (desc.type === 'toggleRefinement') {
              // Toggle's refine takes { isRefined: boolean }
              rs.refine(rs.value);
            } else {
              // refinementList, menu, hierarchicalMenu all take (value: string)
              rs.refine(value);
            }
          };

          // Centralized toggleShowMore — call virtual widget's toggleShowMore,
          // then re-render the composed connector with updated state
          const toggleShowMore = (attribute: string) => {
            const rs = cachedVirtualRenderStates.get(attribute);
            if (!rs?.toggleShowMore) return;

            // This flips the virtual widget's internal isShowingMore
            // and calls widget.render!(renderOptions) → no-op renderFn
            rs.toggleShowMore();

            // Re-render the composed connector to pick up the change
            if (lastRenderOptions) {
              const newState =
                widgetObj.getWidgetRenderState(lastRenderOptions);
              renderFn(
                {
                  ...newState,
                  instantSearchInstance:
                    lastRenderOptions.instantSearchInstance,
                },
                false
              );
            }
          };

          // Centralized createURL — delegate to virtual widget
          const createURLFn = (attribute: string, value: string) => {
            const rs = cachedVirtualRenderStates.get(attribute);
            if (!rs?.createURL) return '#';
            return rs.createURL(value);
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

      return widgetObj as any;
    };
  };

export default connectDynamicFacetsComposed;
