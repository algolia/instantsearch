// @TODO: hook up to some way it can be set runtime, maybe query params
const VERBOSE = true;

export function error(message: string) {
  if (VERBOSE) {
    // eslint-disable-next-line no-console
    console.error(`[Algolia Experiences] ${message}`);
  }
}
