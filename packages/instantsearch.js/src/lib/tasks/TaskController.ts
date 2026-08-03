import { createTaskRunner } from './fetchTask';

import type { TaskRunner, TaskRunnerOptions } from './fetchTask';

/**
 * Stateful engine driving a single Agent Studio task.
 *
 * This is the task-side analog of `AlgoliaSearchHelper`: it owns the request
 * lifecycle (`output`, `isLoading`, `error`), sequences overlapping requests so
 * a stale response can't overwrite a newer one, and notifies subscribers via
 * `on()`. It has zero InstantSearch coupling — the request mechanics live in
 * the stateless `createTaskRunner`; everything stateful lives here.
 */
export class TaskController<TOutput = unknown> {
  /** The latest (unwrapped) task output, or `undefined` before the first `submit` resolves. */
  output: TOutput | undefined;
  /** Whether a `submit` request is currently in flight. */
  isLoading = false;
  /** The error thrown by the last `submit`, or `undefined` when it succeeded (or none has run). */
  error: Error | undefined;

  private runner: TaskRunner;
  private stream: boolean;
  private listeners = new Set<() => void>();
  private requestId = 0;
  private disposed = false;

  constructor(options: TaskRunnerOptions) {
    this.runner = createTaskRunner(options);
    this.stream = options.stream ?? true;
  }

  /** Subscribe to state changes. Returns an unsubscribe function. */
  on(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private emit(): void {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Sends `variables` as the task `input`. Clears the previous `output`
   * immediately, then resolves with this call's own output once the request
   * settles (or `undefined` if it failed — the failure is surfaced via
   * `error`). The returned promise never rejects. A newer `submit` supersedes
   * an older one: the shared state always reflects the latest request.
   */
  submit(variables: Record<string, unknown>): Promise<TOutput | undefined> {
    if (this.disposed) {
      return Promise.resolve(undefined);
    }
    const currentRequestId = (this.requestId += 1);
    const isStale = () => this.disposed || currentRequestId !== this.requestId;
    // Clear the previous output so consumers can show a loading state rather
    // than stale data while the new request is in flight.
    this.output = undefined;
    this.error = undefined;
    this.isLoading = true;
    this.emit();

    // Defer the `runner.submit` call by a microtask so a synchronous throw
    // (e.g. from `prepareRequest`) is caught by the promise chain below.
    return Promise.resolve()
      .then(() =>
        this.runner.submit(variables, {
          onData: this.stream
            ? (partial) => {
                if (isStale()) {
                  return;
                }
                this.output = partial as TOutput;
                this.emit();
              }
            : undefined,
        })
      )
      .then((next): TOutput | undefined => {
        const result = next as TOutput;
        if (!isStale()) {
          this.output = result;
        }
        return result;
      })
      .catch((err): TOutput | undefined => {
        if (!isStale()) {
          this.output = undefined;
          this.error = err instanceof Error ? err : new Error(String(err));
        }
        return undefined;
      })
      .finally(() => {
        if (isStale()) {
          return;
        }
        this.isLoading = false;
        this.emit();
      });
  }

  /**
   * Supersedes any in-flight `submit` so its pending result is ignored (the
   * underlying request is not aborted, just abandoned) and clears the loading
   * flag. Use when the inputs that produced the request are no longer valid.
   */
  invalidate(): void {
    if (this.disposed) {
      return;
    }
    // Bump the request id so any in-flight request's callbacks see `isStale()`
    // and are ignored. The fetch itself is left to complete.
    this.requestId += 1;
    this.isLoading = false;
    this.emit();
  }

  /**
   * Clears `output`/`error`/`isLoading` and abandons any in-flight request.
   * Unlike `invalidate`, this also drops the last `output` — use when the
   * inputs no longer resolve to anything to display.
   */
  reset(): void {
    if (this.disposed) {
      return;
    }
    this.requestId += 1;
    this.output = undefined;
    this.error = undefined;
    this.isLoading = false;
    this.emit();
  }

  /**
   * Tears down the controller: bumps the request id so any in-flight request is
   * ignored and drops all subscribers so late callbacks can't emit.
   */
  dispose(): void {
    this.disposed = true;
    this.requestId += 1;
    this.listeners.clear();
  }
}
