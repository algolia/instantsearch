// Debounce the function call to the trailing edge.
export function debounce(func: Function, wait: number): Function {
  let lastTimeout;
  return function(...args) {
    // @ts-ignore-next-line
    const that = this;
    return new Promise<void>(resolve => {
      clearTimeout(lastTimeout);
      lastTimeout = setTimeout(() => {
        lastTimeout = null;
        func.apply(that, args);
        resolve();
      }, wait);
    });
  };
}

// Debounced function will return a promise which will be either resolved or rejected.
export function debounceAsync(func: Function, wait: number): Function {
  let lastTimeout;
  let lastReject;
  return function(...args) {
    // @ts-ignore-next-line
    const that = this;
    return new Promise<void>((resolve, reject) => {
      if (typeof lastReject === 'function') {
        lastReject();
      }
      lastReject = reject;
      clearTimeout(lastTimeout);
      lastTimeout = setTimeout(() => {
        lastTimeout = null;
        Promise.resolve(func.apply(that, args))
          .then(resolve)
          .catch(reject);
      }, wait);
    });
  };
}
