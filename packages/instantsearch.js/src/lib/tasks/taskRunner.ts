import type { DefaultTaskTransport } from './transport';

export type TaskRunnerOptions = {
  transport: DefaultTaskTransport;
  task: string;
  stream?: boolean;
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

export function createTaskRunner({
  transport,
  task,
  stream = true,
}: TaskRunnerOptions): TaskRunner {
  return {
    submit(input, { onData } = {}) {
      return transport.sendTask({ task, input, stream, onData });
    },
  };
}
