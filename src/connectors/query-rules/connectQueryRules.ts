import {
  AlgoliaSearchHelper as Helper,
  SearchParameters,
} from 'algoliasearch-helper';
import { Connector, TransformItems, WidgetRenderState } from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  warning,
  getRefinements,
  isEqual,
  noop,
} from '../../lib/utils';
import {
  Refinement as InternalRefinement,
  NumericRefinement as InternalNumericRefinement,
} from '../../lib/utils/getRefinements';

type TrackedFilterRefinement = string | number | boolean;

export type ParamTrackedFilters = {
  [facetName: string]: (
    facetValues: TrackedFilterRefinement[]
  ) => TrackedFilterRefinement[];
};
export type ParamTransformRuleContexts = (ruleContexts: string[]) => string[];
type ParamTransformItems = TransformItems<any>;

export type QueryRulesConnectorParams = {
  trackedFilters?: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
  transformItems?: ParamTransformItems;
};

export type QueryRulesRenderState = {
  items: any[];
};

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rules',
  connector: true,
});

function hasStateRefinements(state: SearchParameters): boolean {
  return [
    state.disjunctiveFacetsRefinements,
    state.facetsRefinements,
    state.hierarchicalFacetsRefinements,
    state.numericRefinements,
  ].some(refinement =>
    Boolean(refinement && Object.keys(refinement).length > 0)
  );
}

// A context rule must consist only of alphanumeric characters, hyphens, and underscores.
// See https://www.algolia.com/doc/guides/managing-results/refine-results/merchandising-and-promoting/in-depth/implementing-query-rules/#context
function escapeRuleContext(ruleName: string): string {
  return ruleName.replace(/[^a-z0-9-_]+/gi, '_');
}

function getRuleContextsFromTrackedFilters({
  helper,
  sharedHelperState,
  trackedFilters,
}: {
  helper: Helper;
  sharedHelperState: SearchParameters;
  trackedFilters: ParamTrackedFilters;
}): string[] {
  const ruleContexts = Object.keys(trackedFilters).reduce<string[]>(
    (facets, facetName) => {
      const facetRefinements: TrackedFilterRefinement[] = getRefinements(
        helper.lastResults || {},
        sharedHelperState,
        true
      )
        .filter(
          (refinement: InternalRefinement) => refinement.attribute === facetName
        )
        .map(
          (refinement: InternalRefinement) =>
            (refinement as InternalNumericRefinement).numericValue ||
            refinement.name
        );

      const getTrackedFacetValues = trackedFilters[facetName];
      const trackedFacetValues = getTrackedFacetValues(facetRefinements);

      return [
        ...facets,
        ...facetRefinements
          .filter(facetRefinement =>
            trackedFacetValues.includes(facetRefinement)
          )
          .map(facetValue =>
            escapeRuleContext(`ais-${facetName}-${facetValue}`)
          ),
      ];
    },
    []
  );

  return ruleContexts;
}

function applyRuleContexts(
  this: {
    helper: Helper;
    initialRuleContexts: string[];
    trackedFilters: ParamTrackedFilters;
    transformRuleContexts: ParamTransformRuleContexts;
  },
  event: { state: SearchParameters }
): void {
  const {
    helper,
    initialRuleContexts,
    trackedFilters,
    transformRuleContexts,
  } = this;

  const sharedHelperState = event.state;
  const previousRuleContexts: string[] = sharedHelperState.ruleContexts || [];
  const newRuleContexts = getRuleContextsFromTrackedFilters({
    helper,
    sharedHelperState,
    trackedFilters,
  });
  const nextRuleContexts = [...initialRuleContexts, ...newRuleContexts];

  warning(
    nextRuleContexts.length <= 10,
    `
The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.
`
  );

  const ruleContexts = transformRuleContexts(nextRuleContexts).slice(0, 10);

  if (!isEqual(previousRuleContexts, ruleContexts)) {
    helper.overrideStateWithoutTriggeringChangeEvent({
      ...sharedHelperState,
      ruleContexts,
    });
  }
}

export type QueryRulesWidgetDescription = {
  $$type: 'ais.queryRules';
  renderState: QueryRulesRenderState;
  indexRenderState: {
    queryRules: WidgetRenderState<
      QueryRulesRenderState,
      QueryRulesConnectorParams
    >;
  };
};

export type QueryRulesConnector = Connector<
  QueryRulesWidgetDescription,
  QueryRulesConnectorParams
>;

const connectQueryRules: QueryRulesConnector = function connectQueryRules(
  render,
  unmount = noop
) {
  checkRendering(render, withUsage());

  return widgetParams => {
    const {
      trackedFilters = {} as ParamTrackedFilters,
      transformRuleContexts = (rules => rules) as ParamTransformRuleContexts,
      transformItems = (items => items) as ParamTransformItems,
    } = widgetParams || {};

    Object.keys(trackedFilters).forEach(facetName => {
      if (typeof trackedFilters[facetName] !== 'function') {
        throw new Error(
          withUsage(
            `'The "${facetName}" filter value in the \`trackedFilters\` option expects a function.`
          )
        );
      }
    });

    const hasTrackedFilters = Object.keys(trackedFilters).length > 0;

    // We store the initial rule contexts applied before creating the widget
    // so that we do not override them with the rules created from `trackedFilters`.
    let initialRuleContexts: string[] = [];
    let onHelperChange: (event: { state: SearchParameters }) => void;

    return {
      $$type: 'ais.queryRules',

      init(initOptions) {
        const { helper, state, instantSearchInstance } = initOptions;

        initialRuleContexts = state.ruleContexts || [];
        onHelperChange = applyRuleContexts.bind({
          helper,
          initialRuleContexts,
          trackedFilters,
          transformRuleContexts,
        });

        if (hasTrackedFilters) {
          // We need to apply the `ruleContexts` based on the `trackedFilters`
          // before the helper changes state in some cases:
          //   - Some filters are applied on the first load (e.g. using `configure`)
          //   - The `transformRuleContexts` option sets initial `ruleContexts`.
          if (
            hasStateRefinements(state) ||
            Boolean(widgetParams.transformRuleContexts)
          ) {
            onHelperChange({ state });
          }

          // We track every change in the helper to override its state and add
          // any `ruleContexts` needed based on the `trackedFilters`.
          helper.on('change', onHelperChange);
        }

        render(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { instantSearchInstance } = renderOptions;

        render(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance,
          },
          false
        );
      },

      getWidgetRenderState({ results }) {
        const { userData = [] } = results || {};
        const items = transformItems(userData);

        return {
          items,
          widgetParams,
        };
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          queryRules: this.getWidgetRenderState(renderOptions),
        };
      },

      dispose({ helper, state }) {
        unmount();

        if (hasTrackedFilters) {
          helper.removeListener('change', onHelperChange);

          return state.setQueryParameter('ruleContexts', initialRuleContexts);
        }

        return state;
      },
    };
  };
};

export default connectQueryRules;
