import { startOfDay } from 'date-fns';

/**
 * Returns the latest date from the dataset.
 * It's considered as the current date so that the demo is interactive
 * when filtering by date.
 * This indirection is not needed in user code.
 */
export function getCurrentDate() {
  return startOfDay(1555164449000);
}
