import { startOfDay } from 'date-fns';

/**
 * Returns the latest date from the dataset considered
 * as the current date so that the demo is interactive.
 * In user code, this isn't necessary.
 */
export function getCurrentDate() {
  return startOfDay(1555164449000);
}
