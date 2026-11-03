import {
  checkRendering,
  createDocumentationMessageGenerator,
  createConcurrentSafePromise,
  addQueryID,
  debounce,
  addAbsolutePosition,
  noop,
  escapeHits,
} from '../../lib/utils';

import type { DebouncedFunction } from '../../lib/utils';
import type {
  Connector,
  Hit,
  FindAnswersOptions,
  FindAnswersResponse,
  WidgetRenderState,
  FindAnswers,
} from '../../types';

type IndexWithAnswers = {
  readonly findAnswers: any;
};

function hasFindAnswersMethod(
  answersIndex: IndexWithAnswers | any
): answersIndex is IndexWithAnswers {
  return typeof (answersIndex as IndexWithAnswers).findAnswers === 'function';
}

const withUsage = createDocumentationMessageGenerator({
  name: 'answers',
  connector: true,
});

export type AnswersRenderState = {
  /**
   * The matched hits from Algolia API.
   */
  hits: Hit[];

  /**
   * Whether it's still loading the results from the Answers API.
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
  queryLanguages: ['en'];

  /**
   * Maximum number of answers to retrieve from the Answers Engine.
   * Cannot be greater than 1000.
   * @default 1
   */
  nbHits?: number;

  /**
   * Debounce time in milliseconds to debounce render
   * @default 100
   */
  renderDebounceTime?: number;

  /**
   * Debounce time in milliseconds to debounce search
   * @default 100
   */
  searchDebounceTime?: number;

  /**
   * Whether to escape HTML tags from hits string values.
   *
   * @default true
   */
  escapeHTML?: boolean;

  /**
   * Extra parameters to pass to findAnswers method.
   * @default {}
   */
  extraParameters?: FindAnswersOptions;
};

export type AnswersWidgetDescription = {
  $$type: 'ais.answers';
  renderState: AnswersRenderState;
  indexRenderState: {
    answers: WidgetRenderState<AnswersRenderState, AnswersConnectorParams>;
  };
};

export type AnswersConnector = Connector<
  AnswersWidgetDescription,
  AnswersConnectorParams
>;

/**
 * @deprecated the answers service is no longer offered, and this widget will be removed in InstantSearch.js v5
 */
const connectAnswers: AnswersConnector = function connectAnswers(
  renderFn,
  unmountFn = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      queryLanguages,
      attributesForPrediction,
      nbHits = 1,
      renderDebounceTime = 100,
      searchDebounceTime = 100,
      // @MAJOR: this can default to false
      escapeHTML = true,
      extraParameters = {},
    } = widgetParams || {};

    // @ts-expect-error checking for the wrong value
    if (!queryLanguages || queryLanguages.length === 0) {
      throw new Error(
        withUsage('The `queryLanguages` expects an array of strings.')
      );
    }

    const runConcurrentSafePromise =
      createConcurrentSafePromise<FindAnswersResponse<Hit>>();

    let lastHits: FindAnswersResponse<Hit>['hits'] = [];
    let isLoading = false;
    const debouncedRender = debounce(renderFn, renderDebounceTime);

    let debouncedRefine: DebouncedFunction<FindAnswers>;

    return {
      $$type: 'ais.answers',

      init(initOptions) {
        const { state, instantSearchInstance } = initOptions;
        if (typeof instantSearchInstance.client.initIndex !== 'function') {
          throw new Error(withUsage('`algoliasearch` <5 required.'));
        }
        const answersIndex = (instantSearchInstance.client.initIndex as any)(
          state.index
        );
        if (!hasFindAnswersMethod(answersIndex)) {
          throw new Error(withUsage('`algoliasearch` >= 4.8.0 required.'));
        }
        debouncedRefine = debounce(
          answersIndex.findAnswers as unknown as FindAnswers,
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
          lastHits = [];
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
        lastHits = [];
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
            ...extraParameters,
            nbHits,
            attributesForPrediction,
          }) as unknown as Promise<FindAnswersResponse<Hit>>
        ).then((result) => {
          if (!result) {
            // It's undefined when it's debounced.
            return;
          }

          if (escapeHTML && result.hits.length > 0) {
            result.hits = escapeHits(result.hits);
          }

          const hitsWithAbsolutePosition = addAbsolutePosition(
            result.hits,
            0,
            nbHits
          );

          const hitsWithAbsolutePositionAndQueryID = addQueryID(
            hitsWithAbsolutePosition,
            result.queryID
          );

          lastHits = hitsWithAbsolutePositionAndQueryID;
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
          hits: lastHits,
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
