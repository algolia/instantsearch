const nextMicroTask = Promise.resolve();

type Callback = (...args: any[]) => void;
type Defer = Callback & {
  wait(): Promise<void>;
  cancel(): void;
};

const defer = (callback: Callback): Defer => {
  let progress: Promise<void> | null = null;
  let cancelled = false;

  const fn: Defer = (...args) => {
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
  };

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
};

export default defer;
