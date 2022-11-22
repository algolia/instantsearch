import {
  getUnixTime,
  addDays,
  addMonths,
  addWeeks,
  addYears,
  startOfDay,
} from 'date-fns';

const currentDate = new Date();

export const DATE_RANGES = [
  { label: 'All time' },
  {
    label: 'Last 24h',
    start: getUnixTime(startOfDay(addDays(currentDate, -1))),
  },
  {
    label: 'Past week',
    start: getUnixTime(startOfDay(addWeeks(currentDate, -1))),
  },
  {
    label: 'Past month',
    start: getUnixTime(startOfDay(addMonths(currentDate, -1))),
  },
  {
    label: 'Past year',
    start: getUnixTime(startOfDay(addYears(currentDate, -1))),
  },
];

export const getDateRangeFromTimestamp = (timestamps: number[]) => {
  const [start] = timestamps;
  const range = start && DATE_RANGES.find((item) => item.start === start);
  return range ? range.label : '';
};
