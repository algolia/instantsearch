const nextMicroTask = Promise.resolve();

type Callback = (...args: any[]) => void;
type Defer = {
  wait: () => Promise<void>;
  cancel: () => void;
};

export function defer<TCallback extends Callback>(
  callback: TCallback
): TCallback & Defer {
  let progress: Promise<void> | null = null;
  let cancelled = false;

  const fn = ((...args: Parameters<TCallback>) => {
    if (progress !== null) {
      return;
    }

    progress = nextMicroTask.then(() => {
      progress = null;

      if (cancelled) {
        cancelled = false;
        return;
      }

      callback(...args);
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
