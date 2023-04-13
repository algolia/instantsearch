type Callback = (...args: any[]) => void;
type Defer = {
  wait(): Promise<void>;
  cancel(): void;
};

export function defer<TCallback extends Callback>(
  callback: TCallback,
  nextTask?: () => Promise<void>
): TCallback & Defer {
  let progress: Promise<void> | null = null;
  let cancelled = false;
  const nextTaskFn = nextTask || Promise.resolve.bind(Promise);

  const fn = ((...args: Parameters<TCallback>) => {
    if (progress !== null) {
      return;
    }

    progress = nextTaskFn().then(() => {
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
