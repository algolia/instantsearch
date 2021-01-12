import {
  checkRendering,
  createDocumentationMessageGenerator,
  createConcurrentSafePromise,
  debounce,
  addAbsolutePosition,
  noop,
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
   * Debounce time in milliseconds to debounce answers API
   * default: 200
   */
  debounceTime?: number;
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
      attributesForPrediction = ['*'],
      nbHits = 1,
      debounceTime = 200,
    } = widgetParams || ({} as typeof widgetParams);

    if (!queryLanguages || queryLanguages.length === 0) {
      throw new Error(
        withUsage('The `queryLanguages` expects an array of strings.')
      );
    }

    const runConcurrentSafePromise = createConcurrentSafePromise<
      FindAnswersResponse<Hit>
    >();

    let lastAnswersResult: Partial<FindAnswersResponse<Hit>>;
    let isLoading = false;
    const debouncedRenderFn = debounce(renderFn, debounceTime);

    return {
      $$type: 'ais.answers',

      init(initOptions) {
        renderFn(
          {
            ...this.getWidgetRenderState(initOptions),
            instantSearchInstance: initOptions.instantSearchInstance,
          },
          true
        );
      },

      render(renderOptions) {
        const { state, instantSearchInstance } = renderOptions;
        const { query, index } = state;
        const answersIndex = instantSearchInstance.client!.initIndex!(index);
        if (!answersIndex.findAnswers) {
          throw new Error(withUsage('`algoliasearch` >= 4.8.0 required.'));
        }
        if (!query) {
          // renders nothing with empty query
          lastAnswersResult = {};
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
          answersIndex.findAnswers(query, queryLanguages, {
            nbHits,
            attributesForPrediction,
            // eslint-disable-next-line no-warning-comments
            // FIXME: remove this x-algolia-agent once the engine accepts url encoded query params
            queryParameters: {
              'x-algolia-agent': 'answers-test',
            },
          })
        ).then(result => {
          lastAnswersResult = result;
          lastAnswersResult.hits = addAbsolutePosition<typeof result.hits[0]>(
            result.hits,
            0,
            nbHits
          );
          isLoading = false;
          debouncedRenderFn(
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
          hits: (lastAnswersResult && lastAnswersResult.hits) || [],
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
