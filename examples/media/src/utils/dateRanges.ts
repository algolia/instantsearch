import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  endOfMonth,
  endOfYear,
  getUnixTime,
  startOfMonth,
  startOfYear,
} from 'date-fns';

const currentDate = new Date();

export const DATE_RANGES = [
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
];

export const getDateRangeFromTimestamp = (timestamps: number[]) => {
  const [start] = timestamps;
  const range = start && DATE_RANGES.find(item => item.start === start);
  return range ? range.label : '';
};
