import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { createDocumentationMessageGenerator } from '../../lib/utils';
import { Widget } from '../../types';

type AnalyticsWidgetParams = {
  pushFunction(
    formattedParameters: string,
    state: SearchParameters,
    results: SearchResults
  ): void;
  /**
   * @default 3000
   */
  delay: number;
  /**
   * @default false
   */
  triggerOnUIInteraction: boolean;
  /**
   * @default false
   */
  pushInitialSearch: boolean;
  /**
   * @default false
   */
  pushPagination: boolean;
};

const withUsage = createDocumentationMessageGenerator({ name: 'analytics' });

function analytics(
  {
    pushFunction,
    delay = 3000,
    triggerOnUIInteraction = false,
    pushInitialSearch = true,
    pushPagination = false,
  }: AnalyticsWidgetParams = {} as AnalyticsWidgetParams
): Widget {
  if (!pushFunction) {
    throw new Error(withUsage('The `pushFunction` option is required.'));
  }

  type AnalyticsState = {
    results: SearchResults;
    state: SearchParameters;
  } | null;

  let cachedState: AnalyticsState = null;

  type RefinementParameters = {
    [key: string]: string[];
  };

  const serializeRefinements = function(
    parameters: RefinementParameters
  ): string {
    const refinements: string[] = [];

    for (const parameter in parameters) {
      if (parameters.hasOwnProperty(parameter)) {
        const values = parameters[parameter].join('+');

        refinements.push(
          `${encodeURIComponent(parameter)}=${encodeURIComponent(
            parameter
          )}_${encodeURIComponent(values)}`
        );
      }
    }

    return refinements.join('&');
  };

  const serializeNumericRefinements = function(
    numericRefinements: SearchParameters['numericRefinements']
  ): string {
    const refinements: string[] = [];

    for (const attribute in numericRefinements) {
      if (numericRefinements.hasOwnProperty(attribute)) {
        const filter = numericRefinements[attribute];

        if (filter.hasOwnProperty('>=') && filter.hasOwnProperty('<=')) {
          if (
            filter['>='] &&
            filter['>='][0] === filter['<='] &&
            filter['<='][0]
          ) {
            refinements.push(`${attribute}=${attribute}_${filter['>=']}`);
          } else {
            refinements.push(
              `${attribute}=${attribute}_${filter['>=']}to${filter['<=']}`
            );
          }
        } else if (filter.hasOwnProperty('>=')) {
          refinements.push(`${attribute}=${attribute}_from${filter['>=']}`);
        } else if (filter.hasOwnProperty('<=')) {
          refinements.push(`${attribute}=${attribute}_to${filter['<=']}`);
        } else if (filter.hasOwnProperty('=')) {
          const equals: string[] = [];

          for (const equal in filter['=']) {
            // eslint-disable-next-line max-depth
            if (filter['='].hasOwnProperty(equal)) {
              equals.push(filter['='][equal]);
            }
          }

          refinements.push(`${attribute}=${attribute}_${equals.join('-')}`);
        }
      }
    }

    return refinements.join('&');
  };

  let lastSentData = '';

  const sendAnalytics = function(analyticsState: AnalyticsState | null): void {
    if (analyticsState === null) {
      return;
    }

    const serializedParams: string[] = [];

    const serializedRefinements = serializeRefinements({
      ...analyticsState.state.disjunctiveFacetsRefinements,
      ...analyticsState.state.facetsRefinements,
      ...analyticsState.state.hierarchicalFacetsRefinements,
    });

    const serializedNumericRefinements = serializeNumericRefinements(
      analyticsState.state.numericRefinements
    );

    if (serializedRefinements !== '') {
      serializedParams.push(serializedRefinements);
    }

    if (serializedNumericRefinements !== '') {
      serializedParams.push(serializedNumericRefinements);
    }

    const stringifiedParams = serializedParams.join('&');

    let dataToSend = `Query: ${analyticsState.state.query ||
      ''}, ${stringifiedParams}`;
    if (pushPagination === true) {
      dataToSend += `, Page: ${analyticsState.state.page || 0}`;
    }

    if (lastSentData !== dataToSend) {
      pushFunction(
        stringifiedParams,
        analyticsState.state,
        analyticsState.results
      );

      lastSentData = dataToSend;
    }
  };

  let pushTimeout: number;
  let isInitialSearch = true;

  if (pushInitialSearch === true) {
    isInitialSearch = false;
  }

  const onClick = (): void => {
    sendAnalytics(cachedState);
  };

  const onUnload = (): void => {
    sendAnalytics(cachedState);
  };

  return {
    init() {
      if (triggerOnUIInteraction === true) {
        document.addEventListener('click', onClick);
        window.addEventListener('beforeunload', onUnload);
      }
    },

    render({ results, state }) {
      if (isInitialSearch === true) {
        isInitialSearch = false;

        return;
      }

      cachedState = { results, state };

      if (pushTimeout) {
        clearTimeout(pushTimeout);
      }

      pushTimeout = window.setTimeout(() => sendAnalytics(cachedState), delay);
    },

    dispose() {
      if (triggerOnUIInteraction === true) {
        document.removeEventListener('click', onClick);
        window.removeEventListener('beforeunload', onUnload);
      }
    },
  };
}

export default analytics;
