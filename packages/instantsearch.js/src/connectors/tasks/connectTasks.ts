import { resolveEndpoint, TaskController } from '../../lib/tasks';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type { TaskTransport } from '../../lib/tasks';
import type {
  IndexRenderState,
  InitOptions,
  Renderer,
  RenderOptions,
  Unmounter,
  Widget,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'tasks',
  connector: true,
});

export type TasksRenderState<TOutput = unknown> = {
  /**
   * The latest (unwrapped) task output, or `undefined` before the first
   * `submit` resolves.
   */
  output: TOutput | undefined;
  /**
   * Whether a `submit` request is currently in flight.
   */
  isLoading: boolean;
  /**
   * The error thrown by the last `submit`, or `undefined` when the last request
   * succeeded (or none has run yet).
   */
  error: Error | undefined;
  /**
   * Sends `variables` as the task `input` and updates the render state with the
   * result. Clears the previous `output` immediately, then resolves with this
   * call's own output once the request settles (or `undefined` if it failed —
   * the failure is surfaced via `error`). The returned promise never rejects.
   */
  submit: (variables: Record<string, unknown>) => Promise<TOutput | undefined>;
  /**
   * Supersedes any in-flight `submit` so its pending result is ignored (the
   * underlying request is not aborted, just abandoned) and clears the loading
   * flag. Use when the inputs that produced the request are no longer valid.
   */
  invalidate: () => void;
  /**
   * Re-runs the search-driven `input` immediately, bypassing the debounce.
   * No-op in manual mode (no `input`) or while a request is already in flight.
   */
  refresh: () => void;
};

/**
 * Optional search-driven mode. When `input` is set, the widget auto-submits
 * whenever the derived input changes between renders — the task-side analog of
 * how `index` re-runs a search when the UI state changes. Without it, the
 * widget is purely manual and `submit`/`invalidate` are driven by the consumer.
 */
export type TasksSearchDrive = {
  /**
   * Maps the current render (search results and state) to the task `input`.
   * Return `null` to clear the output without firing a request (e.g. no results
   * to describe). Called at submit time, after the debounce.
   */
  input?: (renderOptions: RenderOptions) => Record<string, unknown> | null;
  /**
   * Dedup key derived from the current render; when it is unchanged between
   * renders, no refetch fires. Defaults to a JSON stringify of `input(...)`.
   */
  getSignature?: (renderOptions: RenderOptions) => string | null;
  /** Debounce (ms) applied to auto-refetch on a signature change. Default `0`. */
  debounce?: number;
};

/**
 * Either `agentId` or a custom `transport` is required.
 */
export type TasksSource =
  | {
      agentId: string;
      transport?: never;
    }
  | {
      transport: TaskTransport;
      agentId?: never;
    };

/**
 * Projects the raw task engine state into a custom widget render state. Receives
 * the current render options so it can read search `results`/`parent`. When set,
 * its result is what the render function and `getWidgetRenderState` expose — the
 * mapper owns the full shape, including its own `widgetParams`. This is the hook
 * a *preset* over `connectTasks` (e.g. `connectPromptSuggestions`) uses to expose
 * a domain-specific render state instead of the generic task state.
 */
export type TasksMapRenderState = (
  state: TasksRenderState,
  renderOptions: InitOptions | RenderOptions
) => Record<string, unknown>;

export type TasksConnectorParams = TasksSource &
  TasksSearchDrive & {
    task: string;
    stream?: boolean;
    /**
     * Render-state key under which the widget exposes its state in the index
     * render state. Defaults to `'tasks'`. Presets override it (e.g.
     * `'promptSuggestions'`) so consumers read `renderState[indexId].<key>`.
     */
    renderStateKey?: string;
    /**
     * Optional projection from the task engine state to a custom render state.
     * See {@link TasksMapRenderState}.
     */
    mapRenderState?: TasksMapRenderState;
  };

export type TasksWidgetDescription<TOutput = unknown> = {
  $$type: 'ais.tasks';
  renderState: TasksRenderState<TOutput>;
};

export type TasksConnector = <TOutput = unknown>(
  renderFn: Renderer<TasksRenderState<TOutput>, TasksConnectorParams>,
  unmountFn?: Unmounter
) => (
  widgetParams: TasksConnectorParams
) => Widget<
  TasksWidgetDescription<TOutput> & { widgetParams: TasksConnectorParams }
>;

const connectTasks: TasksConnector = function connectTasks<TOutput = unknown>(
  renderFn: Renderer<TasksRenderState<TOutput>, TasksConnectorParams>,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return (widgetParams) => {
    const {
      agentId,
      transport,
      task,
      stream = true,
      input,
      getSignature,
      debounce = 0,
      renderStateKey = 'tasks',
      mapRenderState,
    } = widgetParams;

    if (!agentId && !transport) {
      throw new Error(
        withUsage(
          'The `agentId` option is required unless a custom `transport` is provided.'
        )
      );
    }

    if (!task) {
      throw new Error(withUsage('The `task` option is required.'));
    }

    // The stateful request engine (output/isLoading/error, request
    // sequencing). Created in `init` once credentials are resolvable from the
    // search client; `undefined` beforehand.
    let controller: TaskController<TOutput> | undefined;
    let unsubscribe: () => void = noop;

    // Search-driven mode: auto-submit whenever the input signature changes.
    const autoMode = typeof input === 'function';
    let latestRenderOptions: InitOptions | RenderOptions | undefined;
    let lastSignature: string | null = null;
    let debounceTimer: ReturnType<typeof setTimeout> | undefined;
    // True between a signature change and the debounced submit that follows.
    // While pending, a still-in-flight previous request must not paint, so
    // controller emits are suppressed until the new submit starts.
    let refetchPending = false;

    const computeSignature = (
      renderOptions: RenderOptions
    ): string | null => {
      if (getSignature) {
        return getSignature(renderOptions);
      }
      const nextInput = input!(renderOptions);
      return nextInput === null ? null : JSON.stringify(nextInput);
    };

    const fire = (renderOptions: RenderOptions) => {
      if (!controller) {
        return;
      }
      refetchPending = false;
      const nextInput = input!(renderOptions);
      if (nextInput === null) {
        // Nothing to describe — clear any previous output rather than fetch.
        controller.reset();
        return;
      }
      controller.submit(nextInput);
    };

    const submit = (
      variables: Record<string, unknown>
    ): Promise<TOutput | undefined> =>
      controller ? controller.submit(variables) : Promise.resolve(undefined);

    const invalidate = () => {
      controller?.invalidate();
    };

    const refresh = () => {
      if (!autoMode || !controller || controller.isLoading) {
        return;
      }
      const renderOptions = latestRenderOptions;
      if (!renderOptions || !('results' in renderOptions) || !renderOptions.results) {
        return;
      }
      clearTimeout(debounceTimer);
      lastSignature = computeSignature(renderOptions);
      fire(renderOptions);
    };

    const buildEngineState = (): TasksRenderState<TOutput> => ({
      output: controller?.output,
      isLoading: controller?.isLoading ?? false,
      error: controller?.error,
      submit,
      invalidate,
      refresh,
    });

    // The widget render state exposed to the render function and to consumers.
    // With `mapRenderState`, the mapper owns the full shape (including its own
    // `widgetParams`); otherwise it's the raw engine state plus this widget's
    // `widgetParams`.
    const computeWidgetRenderState = (
      renderOptions: InitOptions | RenderOptions
    ): Record<string, unknown> =>
      mapRenderState
        ? mapRenderState(buildEngineState(), renderOptions)
        : { ...buildEngineState(), widgetParams };

    // Calls the render function with the current widget render state merged with
    // the active `instantSearchInstance`.
    const triggerRender = (
      renderOptions: InitOptions | RenderOptions,
      isFirstRendering: boolean
    ) => {
      renderFn(
        {
          ...computeWidgetRenderState(renderOptions),
          instantSearchInstance: renderOptions.instantSearchInstance,
        } as unknown as Parameters<typeof renderFn>[0],
        isFirstRendering
      );
    };

    return {
      $$type: 'ais.tasks',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;
        latestRenderOptions = initOptions;

        if (transport) {
          const resolved = resolveEndpoint({ transport });
          controller = new TaskController<TOutput>({
            endpoint: resolved.endpoint,
            headers: resolved.headers,
            task,
            stream,
            prepareRequest: resolved.prepareSendMessagesRequest,
          });
        } else {
          const [appId, apiKey] = getAppIdAndApiKey(
            instantSearchInstance.client
          );

          if (!appId || !apiKey) {
            throw new Error(
              withUsage(
                'Could not extract Algolia credentials from the search client.'
              )
            );
          }

          const resolved = resolveEndpoint({
            appId,
            apiKey,
            agentId,
            algoliaAgent: getAlgoliaAgent(instantSearchInstance.client),
          });
          controller = new TaskController<TOutput>({
            endpoint: resolved.endpoint,
            headers: resolved.headers,
            task,
            stream,
          });
        }

        unsubscribe = controller.on(() => {
          // Ignore a stale in-flight request's emits during the debounce window
          // so its output doesn't flash before the new submit starts.
          if (refetchPending) {
            return;
          }
          triggerRender(latestRenderOptions ?? initOptions, false);
        });

        triggerRender(initOptions, true);
      },

      render(renderOptions) {
        latestRenderOptions = renderOptions;

        if (autoMode) {
          const signature = renderOptions.results
            ? computeSignature(renderOptions)
            : null;
          if (signature !== lastSignature) {
            lastSignature = signature;
            refetchPending = true;
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
              // Auto-mode only schedules from `render`, so by the time this
              // fires `latestRenderOptions` is always a `RenderOptions`.
              const options = latestRenderOptions as RenderOptions | undefined;
              if (options) {
                fire(options);
              }
            }, debounce);
          }
        }

        triggerRender(renderOptions, false);
      },

      dispose() {
        clearTimeout(debounceTimer);
        unsubscribe();
        controller?.dispose();
        unmountFn();
      },

      getWidgetRenderState(renderOptions) {
        return computeWidgetRenderState(renderOptions) as WidgetRenderState<
          TasksRenderState<TOutput>,
          TasksConnectorParams
        >;
      },

      getRenderState(renderState, renderOptions) {
        return {
          ...renderState,
          [renderStateKey]: computeWidgetRenderState(renderOptions),
        } as IndexRenderState;
      },
    };
  };
};

export default connectTasks;
