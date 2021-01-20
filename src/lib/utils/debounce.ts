type Func = (...args: any[]) => any;

type DebouncedFunction<TFunction extends Func> = (
  this: ThisParameterType<TFunction>,
  ...args: Parameters<TFunction>
) => void;

type DebouncedAsyncFunction<TFunction extends Func> = (
  this: ThisParameterType<TFunction>,
  ...args: Parameters<TFunction>
) => Promise<ReturnType<TFunction>>;

// Debounce a synchronous function call to the trailing edge.
export function debounce<TFunction extends Func>(
  func: TFunction,
  wait: number
): DebouncedFunction<TFunction> {
  let lastTimeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args) {
    // @ts-ignore-next-line
    const that = this;

    if (lastTimeout) {
      clearTimeout(lastTimeout);
    }
    lastTimeout = setTimeout(() => {
      lastTimeout = null;
      func.apply(that, args);
    }, wait);
  };
}

// Debounce an asynchronous function call to the trailing edge.
// The debounced function returns a promise.
export function debounceAsync<TFunction extends Func>(
  func: TFunction,
  wait: number
): DebouncedAsyncFunction<TFunction> {
  let lastTimeout: ReturnType<typeof setTimeout> | null = null;
  let lastReject: (reason?: any) => void | undefined;
  return function(...args) {
    // @ts-ignore-next-line
    const that = this;
    return new Promise((resolve, reject) => {
      if (typeof lastReject === 'function') {
        lastReject();
      }
      lastReject = reject;
      if (lastTimeout) {
        clearTimeout(lastTimeout);
      }
      lastTimeout = setTimeout(() => {
        lastTimeout = null;
        Promise.resolve(func.apply(that, args))
          .then(resolve)
          .catch(reject);
      }, wait);
    });
  };
}
