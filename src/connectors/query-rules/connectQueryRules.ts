import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import {
  Renderer,
  RenderOptions,
  WidgetFactory,
  Helper,
  HelperState,
} from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  warning,
  getRefinements,
} from '../../lib/utils';
import {
  Refinement as InternalRefinement,
  NumericRefinement as InternalNumericRefinement,
} from '../../lib/utils/getRefinements';

export type ParamTrackedFilters = {
  [facetName: string]: (
    facetValues: Array<string | number>
  ) => Array<string | number>;
};
export type ParamTransformRuleContexts = (ruleContexts: string[]) => string[];
type ParamTransformItems = (items: object[]) => any;

export type QueryRulesConnectorParams = {
  trackedFilters?: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
  transformItems?: ParamTransformItems;
};

export interface QueryRulesRenderOptions<T> extends RenderOptions<T> {
  items: object[];
}

export type QueryRulesRenderer<T> = Renderer<
  QueryRulesRenderOptions<QueryRulesConnectorParams & T>
>;

export type QueryRulesWidgetFactory<T> = WidgetFactory<
  QueryRulesConnectorParams & T
>;

export type QueryRulesConnector = <T>(
  render: QueryRulesRenderer<T>,
  unmount?: () => void
) => QueryRulesWidgetFactory<T>;

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rules',
  connector: true,
});

function hasStateRefinements({
  disjunctiveFacetsRefinements,
  facetsRefinements,
  hierarchicalFacetsRefinements,
  numericRefinements,
}) {
  return [
    disjunctiveFacetsRefinements,
    facetsRefinements,
    hierarchicalFacetsRefinements,
    numericRefinements,
  ].some(refinement => Object.keys(refinement).length > 0);
}

// A context rule must consist only of alphanumeric characters, hyphens, and underscores.
// See https://www.algolia.com/doc/guides/managing-results/refine-results/merchandising-and-promoting/in-depth/implementing-query-rules/#context
function escapeRuleContext(ruleName: string) {
  return ruleName.replace(/[^a-z0-9-_]+/gi, '_');
}

function getRuleContextsFromTrackedFilters({
  helper,
  sharedHelperState,
  trackedFilters,
}: {
  helper: Helper;
  sharedHelperState: HelperState;
  trackedFilters: ParamTrackedFilters;
}) {
  const ruleContexts = Object.keys(trackedFilters).reduce<string[]>(
    (facets, facetName) => {
      const facetRefinements: Array<string | number> = getRefinements(
        helper.lastResults || {},
        sharedHelperState
      )
        .filter(
          (refinement: InternalRefinement) =>
            refinement.attributeName === facetName
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
  sharedHelperState: HelperState
) {
  const {
    helper,
    initialRuleContexts,
    trackedFilters,
    transformRuleContexts,
  } = this;

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

const connectQueryRules: QueryRulesConnector = (render, unmount = noop) => {
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
    let onHelperChange: (state: HelperState) => void;

    return {
      init({ helper, state, instantSearchInstance }) {
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
            onHelperChange(state);
          }

          // We track every change in the helper to override its state and add
          // any `ruleContexts` needed based on the `trackedFilters`.
          helper.on('change', onHelperChange);
        }

        render(
          {
            items: [],
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ results, instantSearchInstance }) {
        const { userData = [] } = results;
        const items = transformItems(userData);

        render(
          {
            items,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
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
