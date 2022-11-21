/** Promise for a timeout of a certain number of ms */
export const wait = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
