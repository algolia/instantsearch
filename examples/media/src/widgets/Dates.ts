import {
  getTime,
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
} from 'date-fns';
import { numericMenu, panel } from 'instantsearch.js/es/widgets';

// We fake the current date to be the date of the latest article
const CURRENT_DATE = startOfDay(1555164449000);

const datesList = panel({
  templates: {
    header: 'Date',
  },
})(numericMenu);

export const dates = datesList({
  container: '[data-widget="dates"]',
  attribute: 'date',
  items: [
    { label: 'All time' },
    {
      label: 'Today',
      start: getTime(startOfDay(CURRENT_DATE)),
      end: getTime(endOfDay(CURRENT_DATE)),
    },
    {
      label: 'This week',
      start: getTime(startOfWeek(CURRENT_DATE)),
      end: getTime(endOfWeek(CURRENT_DATE)),
    },
    {
      label: 'This month',
      start: getTime(startOfMonth(CURRENT_DATE)),
      end: getTime(endOfMonth(CURRENT_DATE)),
    },
    {
      label: 'This year',
      start: getTime(startOfYear(CURRENT_DATE)),
      end: getTime(endOfYear(CURRENT_DATE)),
    },
  ],
});
