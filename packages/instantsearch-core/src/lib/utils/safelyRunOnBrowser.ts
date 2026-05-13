// eslint-disable-next-line no-restricted-globals
type BrowserCallback<TReturn> = (params: { window: typeof window }) => TReturn;
type SafelyRunOnBrowserOptions<TReturn> = {
  /**
   * Fallback to run on server environments.
   */
  fallback: () => TReturn;
};

/**
 * Runs code on browser environments safely.
 */
export function safelyRunOnBrowser<TReturn>(
  callback: BrowserCallback<TReturn>,
  { fallback }: SafelyRunOnBrowserOptions<TReturn> = {
    fallback: () => undefined as unknown as TReturn,
  }
): TReturn {
  // eslint-disable-next-line no-restricted-globals
  if (typeof window === 'undefined') {
    return fallback();
  }

  // eslint-disable-next-line no-restricted-globals
  return callback({ window });
}
