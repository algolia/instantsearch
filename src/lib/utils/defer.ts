const nextMicroTask = Promise.resolve();

type Callback = (...args: any[]) => void;
type Cancellable = Callback & {
  cancel(): void;
};

const defer = (callback: Callback): Cancellable => {
  let progress: Promise<void> | null = null;
  let cancelled = false;

  const fn: Cancellable = (...args) => {
    if (progress !== null) {
      return;
    }

    progress = nextMicroTask.then(() => {
      if (cancelled) {
        progress = null;
        cancelled = false;
        return;
      }

      callback(...args);
      progress = null;
    });
  };

  fn.cancel = () => {
    if (progress !== null) {
      cancelled = true;
    }
  };

  return fn;
};

export default defer;
