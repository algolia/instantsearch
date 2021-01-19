import {
  checkRendering,
  createDocumentationMessageGenerator,
  createConcurrentSafePromise,
  addQueryID,
  debounce,
  debounceAsync,
  addAbsolutePosition,
  noop,
  escapeHits,
} from '../../lib/utils';
import { Connector, Hits, Hit, FindAnswersResponse } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'answers',
  connector: true,
});

export type AnswersRendererOptions = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Hits;

  /**
   * whether it's still loading the results from the /answers API
   */
  isLoading: boolean;
};

export type AnswersConnectorParams = {
  /**
   * Attributes to use for predictions.
   * If empty, we use all `searchableAttributes` to find answers.
   * All your `attributesForPrediction` must be part of your `searchableAttributes`.
   */
  attributesForPrediction?: string[];

  /**
   * The languages in the query. Currently only supports `en`.
   */
  queryLanguages: Array<'en'>;

  /**
   * Maximum number of answers to retrieve from the Answers Engine.
   * Cannot be greater than 1000.
   */
  nbHits?: number;

  /**
   * Debounce time in milliseconds to debounce render
   * default: 200
   */
  renderDebounceTime?: number;

  /**
   * Debounce time in milliseconds to debounce search
   * default: 100
   */
  searchDebounceTime?: number;

  /**
   * Whether to escape HTML tags from hits string values.
   *
   * @default true
   */
  escapeHTML?: boolean;
};

export type AnswersConnector = Connector<
  AnswersRendererOptions,
  AnswersConnectorParams
>;

const connectAnswers: AnswersConnector = function connectAnswers(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return widgetParams => {
    const {
      queryLanguages,
      attributesForPrediction,
      nbHits = 1,
      renderDebounceTime = 200,
      searchDebounceTime = 100,
      escapeHTML = true,
    } = widgetParams || ({} as typeof widgetParams);

    if (!queryLanguages || queryLanguages.length === 0) {
      throw new Error(
        withUsage('The `queryLanguages` expects an array of strings.')
      );
    }

    const runConcurrentSafePromise = createConcurrentSafePromise<
      FindAnswersResponse<Hit>
    >();

    let lastResult: Partial<FindAnswersResponse<Hit>>;
    let isLoading = false;
    const debouncedRender = debounce(renderFn, renderDebounceTime);
    let debouncedRefine;

    return {
      $$type: 'ais.answers',

      init(initOptions) {
        const { state, instantSearchInstance } = initOptions;
        const answersIndex = instantSearchInstance.client!.initIndex!(
          state.index
        );
        if (!answersIndex.findAnswers) {
          throw new Error(withUsage('`algoliasearch` >= 4.8.0 required.'));
        }
        debouncedRefine = debounceAsync(
          answersIndex.findAnswers,
          searchDebounceTime
        );

        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const query = renderOptions.state.query;
        if (!query) {
          // renders nothing with empty query
          lastResult = {};
          isLoading = false;
          renderFn(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
          return;
        }

        // render the loader
        lastResult = {};
        isLoading = true;
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );

        // call /answers API
        runConcurrentSafePromise(
          debouncedRefine(query, queryLanguages, {
            nbHits,
            attributesForPrediction,
            // eslint-disable-next-line no-warning-comments
            // FIXME: remove this x-algolia-agent once the engine accepts url encoded query params
            queryParameters: {
              'x-algolia-agent': 'answers-test',
            },
          })
        ).then(results => {
          if (!results) {
            // It's undefined when it's debounced.
            return;
          }

          if (escapeHTML && results.hits.length > 0) {
            results.hits = escapeHits(results.hits);
          }
          const initialEscaped = (results.hits as ReturnType<typeof escapeHits>)
            .__escaped;

          results.hits = addAbsolutePosition<typeof results.hits[0]>(
            results.hits,
            0,
            nbHits
          );

          results.hits = addQueryID<typeof results.hits[0]>(
            results.hits,
            results.queryID
          );

          // Make sure the escaped tag stays, even after mapping over the hits.
          // This prevents the hits from being double-escaped if there are multiple
          // hits widgets mounted on the page.
          (results.hits as ReturnType<
            typeof escapeHits
          >).__escaped = initialEscaped;

          lastResult = results;
          isLoading = false;
          debouncedRender(
            {
              ...this.getWidgetRenderState(renderOptions),
              instantSearchInstance: renderOptions.instantSearchInstance,
            },
            false
          );
        });
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          answers: this.getWidgetRenderState(renderOptions),
        };
      },

      getWidgetRenderState() {
        return {
          hits: (lastResult && lastResult.hits) || [],
          isLoading,
          widgetParams,
        };
      },

      dispose({ state }) {
        unmountFn();
        return state;
      },

      getWidgetSearchParameters(state) {
        return state;
      },
    };
  };
};

export default connectAnswers;
