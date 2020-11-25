// Debounce the function call to the trailing edge.
export function debounce(func: Function, wait: number): Function {
  let timeout;
  return function(...args) {
    // @ts-ignore-next-line
    const that = this;
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      timeout = null;
      func.apply(that, args);
    }, wait);
  };
}
