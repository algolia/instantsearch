import {
  checkRendering,
  createDocumentationMessageGenerator,
  createConcurrentSafePromise,
  noop,
} from '../../lib/utils';
import { Connector, Hits, FindAnswersResponse } from '../../types';

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
  attributesForPrediction: string[];

  queryLanguages?: string[];

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
    const { attributesForPrediction, queryLanguages = ['en'], nbHits } =
      widgetParams || ({} as typeof widgetParams);
    // FIXME: replace `FindAnswersResponse<{}>` with `FindAnswersResponse<Hit>`
    // once the change in algoliasearch is released.
    const runConcurrentSafePromise = createConcurrentSafePromise<
      FindAnswersResponse<{}>
    >();

    let lastAnswersResult: Partial<FindAnswersResponse<{}>>;
    let isLoading = false;

    return {
      $$type: 'ais.answers',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
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

        isLoading = true;
        renderFn(
          {
            ...this.getWidgetRenderState(renderOptions),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );

        runConcurrentSafePromise(
          !query
            ? ({} as FindAnswersResponse<{}>) // FIXME: Hit instead of {}
            : answersIndex.findAnswers(query, queryLanguages, {
                nbHits,
                attributesForPrediction,
              })
        ).then(result => {
          lastAnswersResult = result;
          isLoading = false;
          renderFn(
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
