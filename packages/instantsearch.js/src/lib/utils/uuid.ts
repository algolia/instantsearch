/* eslint-disable no-bitwise */

/**
 * Create UUID according to
 * https://www.ietf.org/rfc/rfc4122.txt
 * @return {[string]} generated UUID
 */
export function createUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
