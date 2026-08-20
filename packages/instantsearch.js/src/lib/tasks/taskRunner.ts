import { DefaultTaskTransport } from './transport';

import type { TaskPrepareRequest } from './endpoint';

export type TaskRunnerOptions =
  | {
      transport: DefaultTaskTransport;
      task: string;
      stream?: boolean;
    }
  | {
      transport?: undefined;
      endpoint: string;
      headers: Record<string, string>;
      task: string;
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

export function createTaskRunner(options: TaskRunnerOptions): TaskRunner {
  const { task, stream = true } = options;
  let transport: DefaultTaskTransport;

  if (options.transport !== undefined) {
    transport = options.transport;
  } else {
    const { prepareRequest } = options;
    transport = new DefaultTaskTransport({
      api: options.endpoint,
      headers: options.headers,
      prepareSendMessagesRequest: prepareRequest
        ? ({ task: requestTask, input }) =>
            prepareRequest({ task: requestTask, input })
        : undefined,
    });
  }

  return {
    submit(input, { onData } = {}) {
      return transport.sendTask({ task, input, stream, onData });
    },
  };
}
