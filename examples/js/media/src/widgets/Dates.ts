import { numericMenu, panel } from 'instantsearch.js/es/widgets';

import { DATE_RANGES } from '../utils';

const createDatesList = (header: string) =>
  panel({
    templates: {
      header,
    },
  })(numericMenu);

export const createDates = ({
  container,
  header,
}: {
  container: string;
  header: string;
}) =>
  createDatesList(header)({
    container,
    attribute: 'created_at_timestamp',
    items: DATE_RANGES,
  });
