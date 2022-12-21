/** Promise for a timeout of a certain number of ms */
export const wait = (ms: number = 0) =>
  new Promise((resolve) => setTimeout(resolve, ms));
