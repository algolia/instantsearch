import { createTaskController } from 'instantsearch.js/es/lib/tasks';
import { useCallback, useEffect, useMemo, useReducer } from 'react';

import type {
  CreateTaskControllerOptions,
  TaskController,
} from 'instantsearch.js/es/lib/tasks';

export type UseTaskProps = CreateTaskControllerOptions;

export type UseTaskResult<TOutput> = {
  /** Latest (unwrapped) task output, or `undefined` before the first `submit` resolves. */
  output: TOutput | undefined;
  /** Whether a `submit` request is currently in flight. */
  isLoading: boolean;
  /** Error from the last `submit`, or `undefined` on success. */
  error: Error | undefined;
  /** Sends `variables` as the task `input`. The returned promise never rejects. */
  submit: (variables: Record<string, unknown>) => Promise<TOutput | undefined>;
  /** Clears output/error and abandons any in-flight request. */
  reset: () => void;
};

/**
 * Subscribes a React component to a standalone {@link TaskController}.
 *
 * This is the headless, InstantSearch-free binding for the task engine: it
 * builds a controller from plain credentials (or a `transport`), re-renders on
 * every controller state change (including each streamed partial), and disposes
 * it on unmount. Unlike the connector hooks in this package it needs **no
 * `<InstantSearch>` provider** — it is the primitive a standalone task/agent UI
 * (e.g. `PromptSuggestionsStandalone`) is built from.
 *
 * When you are inside `<InstantSearch>`, use the connector hook for the widget
 * instead (e.g. `usePromptSuggestions`); this hook is for the standalone case.
 */
export function useTask<TOutput = unknown>({
  appId,
  apiKey,
  agentId,
  algoliaAgent,
  transport,
  task,
  stream,
}: UseTaskProps): UseTaskResult<TOutput> {
  const controller = useMemo<TaskController<TOutput>>(
    () =>
      createTaskController<TOutput>({
        appId,
        apiKey,
        agentId,
        algoliaAgent,
        transport,
        task,
        stream,
      }),
    [appId, apiKey, agentId, algoliaAgent, transport, task, stream]
  );

  // The controller mutates its own state in place and notifies on every change;
  // we just force a re-render and read the live fields below.
  const [, forceRender] = useReducer((n: number) => n + 1, 0);
  useEffect(() => controller.on(forceRender), [controller]);
  useEffect(() => () => controller.dispose(), [controller]);

  const submit = useCallback(
    (variables: Record<string, unknown>) => controller.submit(variables),
    [controller]
  );
  const reset = useCallback(() => controller.reset(), [controller]);

  return {
    output: controller.output,
    isLoading: controller.isLoading,
    error: controller.error,
    submit,
    reset,
  };
}
