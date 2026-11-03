const nextMicroTask = Promise.resolve();

type Callback = (...args: any[]) => void;
type Defer = {
  wait: () => Promise<void>;
  cancel: () => void;
};

export function defer<TCallback extends Callback>(
  callback: TCallback,
  // A call that lands while a run is already pending is dropped, and so are its
  // arguments: the first caller of the window decides what the single run
  // receives. Pass this to fold every later argument into the pending ones
  // instead.
  mergeArguments?: (
    pending: Parameters<TCallback>,
    next: Parameters<TCallback>
  ) => Parameters<TCallback>
): TCallback & Defer {
  let progress: Promise<void> | null = null;
  let cancelled = false;
  let pendingArgs: Parameters<TCallback> | null = null;

  const fn = ((...args: Parameters<TCallback>) => {
    if (progress !== null) {
      if (mergeArguments && pendingArgs !== null) {
        pendingArgs = mergeArguments(pendingArgs, args);
      }
      return;
    }

    pendingArgs = args;

    progress = nextMicroTask.then(() => {
      progress = null;
      const runArgs = pendingArgs as Parameters<TCallback>;
      pendingArgs = null;

      if (cancelled) {
        cancelled = false;
        return;
      }

      callback(...runArgs);
    });
  }) as TCallback & Defer;

  fn.wait = () => {
    if (progress === null) {
      throw new Error(
        'The deferred function should be called before calling `wait()`'
      );
    }

    return progress;
  };

  fn.cancel = () => {
    if (progress === null) {
      return;
    }

    cancelled = true;
  };

  return fn;
}
