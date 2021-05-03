import { SearchParameters, SearchResults } from 'algoliasearch-helper';
import { createDocumentationMessageGenerator, warning } from '../../lib/utils';
import { WidgetFactory, WidgetRenderState } from '../../types';

export type AnalyticsWidgetParamsPushFunction = (
  /**
   * Contains the search parameters, serialized as a query string.
   */
  formattedParameters: string,

  /**
   * Contains the whole search state.
   */
  state: SearchParameters,

  /**
   * The last received results.
   */
  results: SearchResults
) => void;

export type AnalyticsWidgetParams = {
  /**
   * A function that is called every time the query or refinements changes. You
   * need to add the logic to push the data to your analytics platform.
   */
  pushFunction: AnalyticsWidgetParamsPushFunction;

  /**
   * The number of milliseconds between the last search keystroke and calling `pushFunction`.
   *
   * @default 3000
   */
  delay?: number;

  /**
   * Triggers `pushFunction` after click on page or redirecting the page. This is useful if
   * you want the pushFunction to be called for the last actions before the user leaves the
   * current page, even if the delay wasn’t reached.
   *
   * @default false
   */
  triggerOnUIInteraction?: boolean;

  /**
   * Triggers `pushFunction` when InstantSearch is initialized. This means
   * the `pushFunction` might be called even though the user didn’t perfom
   * any search-related action.
   *
   * @default true
   */
  pushInitialSearch?: boolean;

  /**
   * Triggers `pushFunction` when the page changes, either through the UI or programmatically.
   *
   * @default false
   */
  pushPagination?: boolean;
};

const withUsage = createDocumentationMessageGenerator({ name: 'analytics' });

export type AnalyticsWidgetDescription = {
  $$type: 'ais.analytics';
  $$widgetType: 'ais.analytics';
  renderState: Record<string, unknown>;
  indexRenderState: {
    analytics: WidgetRenderState<
      Record<string, unknown>,
      AnalyticsWidgetParams
    >;
  };
};

export type AnalyticsWidget = WidgetFactory<
  AnalyticsWidgetDescription,
  AnalyticsWidgetParams,
  AnalyticsWidgetParams
>;

// @major this widget will be removed from the next major version.
const analytics: AnalyticsWidget = function analytics(widgetParams) {
  const {
    pushFunction,
    delay = 3000,
    triggerOnUIInteraction = false,
    pushInitialSearch = true,
    pushPagination = false,
  } = widgetParams || {};

  if (!pushFunction) {
    throw new Error(withUsage('The `pushFunction` option is required.'));
  }

  warning(
    false,
    `\`analytics\` widget has been deprecated. It is still supported in 4.x releases, but not further. It is replaced by the \`insights\` middleware.

For the migration, visit https://www.algolia.com/doc/guides/building-search-ui/upgrade-guides/js/#analytics-widget`
  );

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
    $$type: 'ais.analytics',
    $$widgetType: 'ais.analytics',

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

    getRenderState(renderState, renderOptions) {
      return {
        ...renderState,
        analytics: this.getWidgetRenderState(renderOptions),
      };
    },

    getWidgetRenderState() {
      return {
        widgetParams,
      };
    },
  };
};

export default analytics;
