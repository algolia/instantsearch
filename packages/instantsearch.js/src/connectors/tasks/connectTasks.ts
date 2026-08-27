import { createTaskRunner } from '../../lib/tasks';
// This connector-only helper is intentionally excluded from public declarations.
import { createTaskTransport } from '../../lib/tasks/endpoint';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type { TaskRunner, TaskTransportOptions } from '../../lib/tasks';
import type { Renderer, Unmounter, Widget } from '../../types';

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
};

/**
 * Either `agentId` or a custom `transport` is required.
 */
export type TasksSource =
  | {
      agentId: string;
      transport?: TaskTransportOptions;
    }
  | {
      transport: TaskTransportOptions;
      agentId?: never;
    };

export type TasksConnectorParams = TasksSource & {
  /** ID of the configured task to run. Either `task` or `kind` is required. */
  task?: string;
  /** Kind of configured task to run. Either `task` or `kind` is required. */
  kind?: string;
  stream?: boolean;
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
    const { agentId, transport, task, kind, stream = true } = widgetParams;

    if (!agentId && !transport) {
      throw new Error(
        withUsage(
          'The `agentId` option is required unless a custom `transport` is provided.'
        )
      );
    }

    if (!task && !kind) {
      throw new Error(withUsage('Either the `task` or `kind` option is required.'));
    }

    let runner: TaskRunner;
    let output: TOutput | undefined;
    let isLoading = false;
    let error: Error | undefined;
    let disposed = false;
    let triggerRender: () => void = noop;
    let requestId = 0;

    const submit = (
      variables: Record<string, unknown>
    ): Promise<TOutput | undefined> => {
      if (disposed) return Promise.resolve(undefined);
      const currentRequestId = (requestId += 1);
      const isStale = () => disposed || currentRequestId !== requestId;
      // Clear the previous output so consumers can show a loading state
      // rather than stale data while the new request is in flight.
      output = undefined;
      error = undefined;
      isLoading = true;
      triggerRender();

      return Promise.resolve()
        .then(() =>
          runner.submit(variables, {
            onData: stream
              ? (partial) => {
                  if (isStale()) return;
                  output = partial as TOutput;
                  triggerRender();
                }
              : undefined,
          })
        )
        .then((next): TOutput | undefined => {
          const result = next as TOutput;
          if (!isStale()) {
            output = result;
          }
          return result;
        })
        .catch((err): TOutput | undefined => {
          if (!isStale()) {
            output = undefined;
            error = err instanceof Error ? err : new Error(String(err));
          }
          return undefined;
        })
        .finally(() => {
          if (isStale()) return;
          isLoading = false;
          triggerRender();
        });
    };

    const invalidate = () => {
      if (disposed) return;
      // Bump the request id so any in-flight request's callbacks see
      // `isStale()` and are ignored. The fetch itself is left to complete.
      requestId += 1;
      isLoading = false;
      triggerRender();
    };

    const getWidgetRenderState = (): TasksRenderState<TOutput> & {
      widgetParams: TasksConnectorParams;
    } => ({
      output,
      isLoading,
      error,
      submit,
      invalidate,
      widgetParams,
    });

    return {
      $$type: 'ais.tasks',

      init(initOptions) {
        const { instantSearchInstance } = initOptions;

        if (agentId) {
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

          const taskTransport = createTaskTransport({
            transport,
            appId,
            apiKey,
            agentId,
            algoliaAgent: getAlgoliaAgent(instantSearchInstance.client),
          });
          runner = createTaskRunner({
            transport: taskTransport,
            task,
            kind,
            stream,
          });
        } else {
          runner = createTaskRunner({
            transport: createTaskTransport({ transport }),
            task,
            kind,
            stream,
          });
        }

        triggerRender = () => {
          renderFn({ ...getWidgetRenderState(), instantSearchInstance }, false);
        };

        renderFn({ ...getWidgetRenderState(), instantSearchInstance }, true);
      },

      render(renderOptions) {
        renderFn(
          {
            ...getWidgetRenderState(),
            instantSearchInstance: renderOptions.instantSearchInstance,
          },
          false
        );
      },

      dispose() {
        disposed = true;
        unmountFn();
      },
    };
  };
};

export default connectTasks;
