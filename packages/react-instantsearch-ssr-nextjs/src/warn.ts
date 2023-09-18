/* eslint-disable no-console, no-empty */

type WarnCache = {
  current: Record<string, boolean>;
};

export const warnCache: WarnCache = {
  current: {},
};

/**
 * Logs a warning if the condition is not met.
 * This is used to log issues in development environment only.
 */
export function warn(condition: boolean, message: string) {
  if (!__DEV__) {
    return;
  }

  if (condition) {
    return;
  }

  const sanitizedMessage = message.trim();
  const hasAlreadyPrinted = warnCache.current[sanitizedMessage];

  if (!hasAlreadyPrinted) {
    warnCache.current[sanitizedMessage] = true;
    const warning = `[react-instantsearch-nextjs] ${sanitizedMessage}`;

    console.warn(warning);

    try {
      // Welcome to debugging InstantSearch.
      //
      // This error was thrown as a convenience so that you can find the source
      // of the warning that appears in the console by enabling "Pause on exceptions"
      // in your debugger.
      throw new Error(warning);
    } catch (error) {}
  }
}
