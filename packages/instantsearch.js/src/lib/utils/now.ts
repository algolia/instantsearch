export const now: () => number =
  typeof performance !== 'undefined'
    ? () => performance.now()
    : () => Date.now();
