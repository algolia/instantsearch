import { numericMenu, panel } from 'instantsearch.js/es/widgets';
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  getUnixTime,
} from 'date-fns';

const currentDate = new Date();

const createDatesList = header =>
  panel({
    templates: {
      header,
    },
  })(numericMenu);

export const createDates = ({ container, header }) =>
  createDatesList(header)({
    container,
    attribute: 'created_at_timestamp',
    items: [
      { label: 'All time' },
      {
        label: 'Today',
        start: getUnixTime(startOfDay(currentDate)),
        end: getUnixTime(endOfDay(currentDate)),
      },
      {
        label: 'This week',
        start: getUnixTime(startOfWeek(currentDate)),
        end: getUnixTime(endOfWeek(currentDate)),
      },
      {
        label: 'This month',
        start: getUnixTime(startOfMonth(currentDate)),
        end: getUnixTime(endOfMonth(currentDate)),
      },
      {
        label: 'This year',
        start: getUnixTime(startOfYear(currentDate)),
        end: getUnixTime(endOfYear(currentDate)),
      },
    ],
  });
