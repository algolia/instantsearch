type Func = (...args: any[]) => any;

type DebouncedFunction<TFunction extends Func> = (
  this: ThisParameterType<TFunction>,
  ...args: Parameters<TFunction>
) => Promise<ReturnType<TFunction>>;

// Debounce a function call to the trailing edge.
// The debounced function returns a promise.
export function debounce<TFunction extends Func>(
  func: TFunction,
  wait: number
): DebouncedFunction<TFunction> {
  let lastTimeout: ReturnType<typeof setTimeout> | null = null;
  return function(...args) {
    return new Promise((resolve, reject) => {
      if (lastTimeout) {
        clearTimeout(lastTimeout);
      }
      lastTimeout = setTimeout(() => {
        lastTimeout = null;
        Promise.resolve(func(...args))
          .then(resolve)
          .catch(reject);
      }, wait);
    });
  };
}
