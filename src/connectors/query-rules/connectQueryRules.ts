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

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rules',
  connector: true,
});

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

const connectQueryRules: QueryRulesConnector = (render, unmount = noop) => {
  checkRendering(render, withUsage());

  // We store the initial rule contexts applied before creating the widget
  // so that we do not override them with the rules created from `trackedFilters`.
  let initialRuleContexts: string[] = [];

  // We track the added rule contexts to remove them when the widget is disposed.
  let addedRuleContexts: string[] = [];

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

    return {
      init({ helper, state, instantSearchInstance }) {
        initialRuleContexts = state.ruleContexts || [];

        if (hasTrackedFilters) {
          // The helper's `ruleContexts` value is by default `undefined`.
          // We want to set it to an empty array to process the same
          // data type both internally and externally (= when passing the
          // `ruleContexts` to the option `transformRuleContexts`).
          if (initialRuleContexts.length === 0) {
            helper.overrideStateWithoutTriggeringChangeEvent({
              ...helper,
              ruleContexts: initialRuleContexts,
            });
          }

          helper.on('change', (sharedHelperState: HelperState) => {
            const previousRuleContexts = sharedHelperState.ruleContexts;
            const nextRuleContexts = getRuleContextsFromTrackedFilters({
              helper,
              sharedHelperState,
              trackedFilters,
            });
            const newRuleContexts = [
              ...initialRuleContexts,
              ...nextRuleContexts,
            ];

            warning(
              newRuleContexts.length <= 10,
              `
The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.
`
            );

            const ruleContexts = transformRuleContexts(newRuleContexts).slice(
              0,
              10
            );

            if (!isEqual(previousRuleContexts, ruleContexts)) {
              helper.overrideStateWithoutTriggeringChangeEvent({
                ...sharedHelperState,
                ruleContexts,
              });
            }

            addedRuleContexts = nextRuleContexts;
          });
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

      dispose({ state }) {
        unmount();

        if (
          hasTrackedFilters &&
          state.ruleContexts &&
          state.ruleContexts.length > 0
        ) {
          const reinitRuleContexts = state.ruleContexts.filter(
            (rule: string) => !addedRuleContexts.includes(rule)
          );

          return state.setQueryParameter('ruleContexts', reinitRuleContexts);
        }

        return state;
      },
    };
  };
};

export default connectQueryRules;
