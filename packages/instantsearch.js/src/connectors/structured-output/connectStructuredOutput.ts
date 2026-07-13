import { createStructuredOutputRunner, resolveEndpoint } from '../../lib/tasks';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type { StructuredOutputRunner, TaskTransport } from '../../lib/tasks';
import type { Connector } from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'structured-output',
  connector: true,
});

export type StructuredOutputRenderState<TOutput = unknown> = {
  /**
   * The latest (unwrapped) structured output returned by the task, or
   * `undefined` before the first `submit` resolves.
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
   * result. Clears the previous `output` immediately, then resolves with the
   * new output once the request settles (or `undefined` if it failed — the
   * failure is surfaced via `error`). The returned promise never rejects.
   */
  submit: (variables: Record<string, unknown>) => Promise<unknown>;
};

/**
 * Either `agentId` or a custom `transport` is required.
 */
export type StructuredOutputSource =
  | {
      agentId: string;
      transport?: never;
    }
  | {
      transport: TaskTransport;
      agentId?: never;
    };

export type StructuredOutputConnectorParams = StructuredOutputSource & {
  task: string;
  stream?: boolean;
};

export type StructuredOutputWidgetDescription<TOutput = unknown> = {
  $$type: 'ais.structuredOutput';
  renderState: StructuredOutputRenderState<TOutput>;
};

export type StructuredOutputConnector = Connector<
  StructuredOutputWidgetDescription,
  StructuredOutputConnectorParams
>;

const connectStructuredOutput: StructuredOutputConnector =
  function connectStructuredOutput(renderFn, unmountFn = noop) {
    checkRendering(renderFn, withUsage());

    return (widgetParams) => {
      const { agentId, transport, task, stream = true } = widgetParams;

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

      let runner: StructuredOutputRunner;
      let output: unknown;
      let isLoading = false;
      let error: Error | undefined;
      let disposed = false;
      let triggerRender: () => void = noop;

      const submit = (variables: Record<string, unknown>): Promise<unknown> => {
        if (disposed) return Promise.resolve(undefined);
        // Clear the previous output so consumers can show a loading state
        // rather than stale data while the new request is in flight.
        output = undefined;
        error = undefined;
        isLoading = true;
        triggerRender();

        return runner
          .submit(variables, {
            onData: stream
              ? (partial) => {
                  if (disposed) return;
                  output = partial;
                  triggerRender();
                }
              : undefined,
          })
          .then((next) => {
            output = next;
          })
          .catch((err) => {
            output = undefined;
            error = err instanceof Error ? err : new Error(String(err));
          })
          .finally(() => {
            isLoading = false;
            if (disposed) return;
            triggerRender();
          })
          .then(() => output);
      };

      const getWidgetRenderState = (): StructuredOutputRenderState & {
        widgetParams: StructuredOutputConnectorParams;
      } => ({
        output,
        isLoading,
        error,
        submit,
        widgetParams,
      });

      return {
        $$type: 'ais.structuredOutput',

        init(initOptions) {
          const { instantSearchInstance } = initOptions;

          if (transport) {
            const resolved = resolveEndpoint({ transport });
            runner = createStructuredOutputRunner({
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
            runner = createStructuredOutputRunner({
              endpoint: resolved.endpoint,
              headers: resolved.headers,
              task,
              stream,
            });
          }

          triggerRender = () => {
            renderFn(
              { ...getWidgetRenderState(), instantSearchInstance },
              false
            );
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

        // No `getRenderState`/`getWidgetRenderState`: this connector is generic
        // and can be instantiated multiple times per index, but there's no
        // natural per-instance key (unlike `attribute` on refinement widgets),
        // so contributing to the shared index render state under a fixed key
        // would make instances clobber one another. State is surfaced through
        // the render function instead — the only way it's consumed.
      };
    };
  };

export default connectStructuredOutput;
