import { buildTaskPayload } from './buildTaskPayload';
import { fetchTask } from './fetchTask';

import type { TaskPrepareRequest } from './buildTaskPayload';

function unwrap(envelope: unknown): unknown {
  return (envelope as { output?: unknown } | null | undefined)?.output;
}

export type StructuredOutputRunnerOptions = {
  endpoint: string;
  headers: Record<string, string>;
  task: string;
  stream?: boolean;
  prepareRequest?: TaskPrepareRequest;
};

export type StructuredOutputSubmitOptions = {
  onData?: (output: unknown) => void;
};

export type StructuredOutputRunner = {
  submit: (
    variables: Record<string, unknown>,
    options?: StructuredOutputSubmitOptions
  ) => Promise<unknown>;
};

export function createStructuredOutputRunner({
  endpoint,
  headers,
  task,
  stream = true,
  prepareRequest,
}: StructuredOutputRunnerOptions): StructuredOutputRunner {
  return {
    submit(variables, { onData } = {}) {
      const payload = buildTaskPayload({
        task,
        input: variables,
        prepareRequest,
      });
      return fetchTask({
        endpoint,
        headers,
        payload,
        stream,
        onData: onData ? (partial) => onData(unwrap(partial)) : undefined,
      }).then(unwrap);
    },
  };
}
