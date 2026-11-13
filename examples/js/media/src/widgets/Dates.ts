import { PanelTemplates, numericMenu, panel } from 'instantsearch.js';

import { DATE_RANGES } from '../utils';

const createDatesList = (
  header: PanelTemplates<typeof numericMenu>['header']
) =>
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
  header: PanelTemplates<typeof numericMenu>['header'];
}) =>
  createDatesList(header)({
    container,
    attribute: 'created_at_timestamp',
    items: DATE_RANGES,
  });
