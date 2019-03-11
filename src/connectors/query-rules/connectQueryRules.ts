import noop from 'lodash/noop';
import isEqual from 'lodash/isEqual';
import {
  Renderer,
  RenderOptions,
  WidgetFactory,
  Helper,
  FacetRefinement,
} from '../../types';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  warning,
} from '../../lib/utils';

const withUsage = createDocumentationMessageGenerator({
  name: 'query-rules',
  connector: true,
});

type ParamTrackedFilters = {
  [facetName: string]: (facetValues: string[]) => string[];
};
type ParamTransformRuleContexts = (ruleContexts: string[]) => string[];
type ParamTransformItems = (items: object[]) => any;

export type QueryRulesConnectorParams = {
  trackedFilters?: ParamTrackedFilters;
  transformRuleContexts?: ParamTransformRuleContexts;
  transformItems?: ParamTransformItems;
};

export interface QueryRulesRenderOptions<T> extends RenderOptions<T> {
  userData: object[];
}

export type QueryRulesRenderer<T> = Renderer<QueryRulesRenderOptions<T>>;

export type QueryRulesWidgetFactory<T> = WidgetFactory<
  QueryRulesConnectorParams & T
>;

export type QueryRulesConnector = {
  <T>(
    render: QueryRulesRenderer<T>,
    unmount?: () => void
  ): QueryRulesWidgetFactory<T>;
};

// A context rule must consist only of alphanumeric characters, hyphens, and underscores.
// See https://www.algolia.com/doc/guides/managing-results/refine-results/merchandising-and-promoting/in-depth/implementing-query-rules/#context
function escapeRuleContext(ruleName: string) {
  return ruleName.replace(/[^a-z0-9-_]+/gi, '_');
}

function getRuleContextsFromTrackedFilters({
  helper,
  trackedFilters,
}: {
  helper: Helper;
  trackedFilters: ParamTrackedFilters;
}) {
  const ruleContexts = Object.keys(trackedFilters).reduce(
    (facets: string[], facetName) => {
      const getFacetValues = trackedFilters[facetName];
      const facetRefinements: string[] = helper
        .getRefinements(facetName)
        .map((refinement: FacetRefinement) => refinement.value);
      const facetValues = getFacetValues(facetRefinements);

      return [
        ...facets,
        ...facetRefinements
          .filter(
            facetRefinement =>
              facetValues.findIndex(
                facetValue => facetValue === facetRefinement
              ) !== -1
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

function prepareRuleContexts({
  initialRuleContexts,
  newRuleContexts,
  transformRuleContexts,
}: {
  initialRuleContexts: string[];
  newRuleContexts: string[];
  transformRuleContexts: ParamTransformRuleContexts;
}) {
  const allRuleContexts = [...initialRuleContexts, ...newRuleContexts];

  warning(
    allRuleContexts.length <= 10,
    `
The maximum number of \`ruleContexts\` is 10. They have been sliced to that limit.
Consider using \`transformRuleContexts\` to minimize the number of rules sent to Algolia.
`
  );

  const ruleContexts = transformRuleContexts(allRuleContexts).slice(0, 10);

  return ruleContexts;
}

function applyRuleContexts({ helper, ruleContexts }) {
  const previousRuleContexts = helper.getQueryParameter('ruleContexts');

  if (!isEqual(previousRuleContexts, ruleContexts)) {
    helper.setQueryParameter('ruleContexts', ruleContexts).search();
  }
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

    return {
      init({ helper, state, instantSearchInstance }) {
        if (Object.keys(trackedFilters).length > 0) {
          initialRuleContexts = state.ruleContexts || [];

          // The helper's method `getQueryParameter` doesn't work on unset attributes.
          // We need to set `ruleContexts` to a default value before retrieving it.
          if (initialRuleContexts.length === 0) {
            helper.setQueryParameter('ruleContexts', initialRuleContexts);
          }

          const newRuleContexts = getRuleContextsFromTrackedFilters({
            helper,
            trackedFilters,
          });
          addedRuleContexts = newRuleContexts;
          const ruleContexts = prepareRuleContexts({
            initialRuleContexts,
            newRuleContexts,
            transformRuleContexts,
          });

          applyRuleContexts({
            helper,
            ruleContexts,
          });
        }

        render(
          {
            userData: [],
            instantSearchInstance,
            widgetParams,
          },
          true
        );
      },

      render({ helper, results, instantSearchInstance }) {
        const { userData: rawUserData = [] } = results;
        const userData = transformItems(rawUserData);

        if (Object.keys(trackedFilters).length > 0) {
          const newRuleContexts = getRuleContextsFromTrackedFilters({
            helper,
            trackedFilters,
          });
          addedRuleContexts = newRuleContexts;
          const ruleContexts = prepareRuleContexts({
            initialRuleContexts,
            newRuleContexts,
            transformRuleContexts,
          });

          applyRuleContexts({
            helper,
            ruleContexts,
          });
        }

        render(
          {
            userData,
            instantSearchInstance,
            widgetParams,
          },
          false
        );
      },

      dispose({ state }) {
        unmount();

        if (Object.keys(trackedFilters).length > 0) {
          const reinitRuleContexts = state
            .getQueryParameter('ruleContexts')
            .filter((rule: string) => !addedRuleContexts.includes(rule));

          return state.setQueryParameter('ruleContexts', reinitRuleContexts);
        }

        return state;
      },
    };
  };
};

export default connectQueryRules;
