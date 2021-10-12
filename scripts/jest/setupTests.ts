import { warnCache } from '../../packages/react-instantsearch-hooks/src/utils';
import { toWarnDev } from './matchers';

expect.extend({ toWarnDev });

// We hide console warnings to not polute the test logs.
global.console.warn = jest.fn();

beforeEach(() => {
  // We reset the log's cache for our log assertions to be isolated in each test.
  warnCache.current = {};
});
