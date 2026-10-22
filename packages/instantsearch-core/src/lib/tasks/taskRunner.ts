import { DefaultTaskTransport } from './transport';

import type { TaskPrepareRequest } from './endpoint';

export type TaskRunnerOptions = {
  transport?: undefined;
  endpoint: string;
  headers: Record<string, string>;
  fetch?: typeof fetch;
  task?: string;
  kind?: string;
  stream?: boolean;
  prepareRequest?: TaskPrepareRequest;
};

export type TaskSubmitOptions = {
  onData?: (output: unknown) => void;
};

export type TaskRunner = {
  submit: (
    variables: Record<string, unknown>,
    options?: TaskSubmitOptions
  ) => Promise<unknown>;
};

export function createTaskRunner(options: {
  transport: DefaultTaskTransport;
  task?: string;
  kind?: string;
  stream?: boolean;
}): TaskRunner;
export function createTaskRunner(options: TaskRunnerOptions): TaskRunner;
export function createTaskRunner(
  options:
    | TaskRunnerOptions
    | {
        transport: DefaultTaskTransport;
        task?: string;
        kind?: string;
        stream?: boolean;
      }
): TaskRunner {
  const { task, kind, stream = true } = options;
  let transport: DefaultTaskTransport;

  if (options.transport !== undefined) {
    transport = options.transport;
  } else {
    const { prepareRequest } = options;
    transport = new DefaultTaskTransport({
      api: options.endpoint,
      headers: options.headers,
      fetch: options.fetch,
      prepareSendMessagesRequest: prepareRequest
        ? ({ task: requestTask, kind: requestKind, input }) =>
            prepareRequest({
              ...(requestTask === undefined ? {} : { task: requestTask }),
              ...(requestKind === undefined ? {} : { kind: requestKind }),
              input,
            })
        : undefined,
    });
  }

  return {
    submit(input, { onData } = {}) {
      return transport.sendTask({ task, kind, input, stream, onData });
    },
  };
}
