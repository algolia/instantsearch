import {
  checkRendering,
  createDocumentationMessageGenerator,
  createConcurrentSafePromise,
  debounce,
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
  queryLanguages?: string[];

  /**
   * Maximum number of answers to retrieve from the Answers Engine.
   * Cannot be greater than 1000.
   */
  nbHits?: number;
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
      attributesForPrediction = ['*'],
      queryLanguages = ['en'],
      nbHits = 1,
    } = widgetParams || ({} as typeof widgetParams);

    if (
      !attributesForPrediction ||
      !Array.isArray(attributesForPrediction) ||
      attributesForPrediction.length === 0
    ) {
      throw new Error(
        withUsage(
          'The `attributesForPrediction` option expects an array of strings.'
        )
      );
    }

    const runConcurrentSafePromise = createConcurrentSafePromise<
      FindAnswersResponse<Hit>
    >();

    let lastAnswersResult: Partial<FindAnswersResponse<Hit>>;
    let isLoading = false;
    const debouncedRenderFn = debounce(renderFn, 200);

    return {
      $$type: 'ais.answers',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
        // eslint-disable-next-line no-warning-comments
        // FIXME: remove this customization once the engine accepts url encoded query params
        if (instantSearchInstance.client.transporter) {
          instantSearchInstance.client.transporter.userAgent.value =
            'answers-test';
        }
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
          })
        ).then(result => {
          lastAnswersResult = result;
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
