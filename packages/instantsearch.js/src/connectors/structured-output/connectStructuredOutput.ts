import { parseJsonEventStream, processStream } from '../../lib/ai-lite';
import {
  checkRendering,
  createDocumentationMessageGenerator,
  getAlgoliaAgent,
  getAppIdAndApiKey,
  noop,
} from '../../lib/utils';

import type {
  Connector,
  IndexRenderState,
  InitOptions,
  Renderer,
  Unmounter,
  UnknownWidgetParams,
  WidgetRenderState,
} from '../../types';

const withUsage = createDocumentationMessageGenerator({
  name: 'structured-output',
  connector: true,
});

export type StructuredOutputTransport = {
  /**
   * The custom API endpoint URL.
   */
  api: string;
  /**
   * Custom headers to send with the request.
   */
  headers?: Record<string, string>;
  /**
   * Function to prepare the request body before sending.
   * Receives the default `{ task, variables }` body and returns the body to send.
   */
  prepareRequest?: (body: Record<string, unknown>) => {
    body: Record<string, unknown>;
  };
};

export type StructuredOutputRenderState<TOutput = Record<string, unknown>> = {
  /**
   * The latest structured output. During streaming this is a progressively
   * completed snapshot; `null` before the first response and after an error.
   */
  output: TOutput | null;
  /**
   * Whether a generation is currently in flight (including while streaming).
   */
  isLoading: boolean;
  /**
   * The error from the last failed generation, if any.
   */
  error: Error | null;
  /**
   * Runs the configured task with the given variables. Cancels any in-flight
   * generation before starting a new one.
   */
  submit: (variables: Record<string, unknown>) => void;
};

export type StructuredOutputConnectorParams = {
  /**
   * The ID of the agent configured in the Algolia dashboard.
   * Required unless a custom `transport` is provided.
   */
  agentId?: string;
  /**
   * The structured task to run (an enabled `structuredTasks.<task>` on the agent).
   */
  task: string;
  /**
   * Whether to stream the output as NDJSON snapshots instead of waiting for the
   * full object.
   * @default false
   */
  stream?: boolean;
  /**
   * Custom transport configuration for the API requests.
   * When provided, allows using a custom endpoint, headers, and request body.
   */
  transport?: StructuredOutputTransport;
  /**
   * Identifier used as the key in `indexRenderState`, so several structured-output
   * widgets can coexist on the same index.
   * @default 'structuredOutput'
   */
  type?: string;
};

export type StructuredOutputWidgetDescription<
  TOutput = Record<string, unknown>
> = {
  $$type: 'ais.structuredOutput';
  renderState: StructuredOutputRenderState<TOutput>;
  indexRenderState: {
    structuredOutput: WidgetRenderState<
      StructuredOutputRenderState<TOutput>,
      StructuredOutputConnectorParams
    >;
  };
};

export type StructuredOutputConnector = Connector<
  StructuredOutputWidgetDescription,
  StructuredOutputConnectorParams
>;

export default (function connectStructuredOutput<
  TWidgetParams extends UnknownWidgetParams
>(
  renderFn: Renderer<
    StructuredOutputRenderState,
    TWidgetParams & StructuredOutputConnectorParams
  >,
  unmountFn: Unmounter = noop
) {
  checkRendering(renderFn, withUsage());

  return <TOutput extends Record<string, unknown> = Record<string, unknown>>(
    widgetParams: TWidgetParams & StructuredOutputConnectorParams
  ) => {
    const {
      agentId,
      task,
      stream = false,
      transport,
      type = 'structuredOutput',
    } = widgetParams || {};

    if (!task) {
      throw new Error(withUsage('The `task` option is required.'));
    }

    if (!agentId && !transport) {
      throw new Error(
        withUsage(
          'The `agentId` option is required unless a custom `transport` is provided.'
        )
      );
    }

    let endpoint: string;
    let headers: Record<string, string>;
    let output: TOutput | null = null;
    let isLoading = false;
    let error: Error | null = null;
    let abortController: AbortController | undefined;
    let render: () => void = noop;

    const buildBody = (variables: Record<string, unknown>) => {
      const body: Record<string, unknown> = { task, variables };
      return transport?.prepareRequest ? transport.prepareRequest(body).body : body;
    };

    const readStream = (response: Response): Promise<void> => {
      if (!response.body) {
        return Promise.reject(new Error('The streaming response has no body.'));
      }

      // Each NDJSON line is a complete snapshot of the output object, so we
      // simply replace the current output on every chunk.
      const snapshots = parseJsonEventStream(
        response.body
      ) as unknown as ReadableStream<TOutput>;

      return new Promise<void>((resolve, reject) => {
        processStream<TOutput>(
          snapshots,
          (snapshot) => {
            output = snapshot;
            render();
          },
          resolve,
          reject
        );
      });
    };

    const submit = (variables: Record<string, unknown>) => {
      abortController?.abort();
      abortController = new AbortController();
      const { signal } = abortController;

      isLoading = true;
      error = null;
      output = null;
      render();

      fetch(endpoint, {
        method: 'POST',
        headers: { ...headers, 'Content-Type': 'application/json' },
        body: JSON.stringify(buildBody(variables)),
        signal,
      })
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error ${response.status}`);
          }

          if (stream) {
            return readStream(response);
          }

          return response.json().then((data) => {
            output = (data?.output ?? null) as TOutput | null;
          });
        })
        .then(() => {
          if (signal.aborted) {
            return;
          }
          isLoading = false;
          render();
        })
        .catch((err) => {
          if (signal.aborted) {
            return;
          }
          error = err as Error;
          output = null;
          isLoading = false;
          render();
        });
    };

    const getWidgetRenderState = () => ({
      output,
      isLoading,
      error,
      submit,
      widgetParams,
    });

    return {
      $$type: 'ais.structuredOutput',

      init(initOptions: InitOptions) {
        const { instantSearchInstance } = initOptions;

        if (transport) {
          endpoint = transport.api;
          headers = transport.headers || {};
        } else {
          const [appId, apiKey] = getAppIdAndApiKey(instantSearchInstance.client);

          if (!appId || !apiKey) {
            throw new Error(
              withUsage(
                'Could not extract Algolia credentials from the search client.'
              )
            );
          }

          endpoint = `https://${appId}.algolia.net/agent-studio/1/agents/${agentId}/structured-outputs?stream=${stream}`;
          headers = {
            'x-algolia-application-id': appId,
            'x-algolia-api-key': apiKey,
            'x-algolia-agent': getAlgoliaAgent(instantSearchInstance.client),
          };
        }

        render = () => {
          renderFn(
            { ...getWidgetRenderState(), instantSearchInstance },
            false
          );
        };

        renderFn({ ...getWidgetRenderState(), instantSearchInstance }, true);
      },

      render({ instantSearchInstance }) {
        renderFn({ ...getWidgetRenderState(), instantSearchInstance }, false);
      },

      dispose() {
        abortController?.abort();
        unmountFn();
      },

      getRenderState(renderState): IndexRenderState &
        StructuredOutputWidgetDescription['indexRenderState'] {
        return {
          ...renderState,
          [type as 'structuredOutput']: getWidgetRenderState(),
        };
      },

      getWidgetRenderState() {
        return getWidgetRenderState();
      },
    };
  };
} satisfies StructuredOutputConnector);
