import { numericMenu, panel } from 'instantsearch.js/es/widgets';

import { DATE_RANGES } from '../utils';
import { PanelTemplates } from 'instantsearch.js/es/widgets/panel/panel';

const createDatesList = (header: PanelTemplates<any>['header']) =>
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
  header: PanelTemplates<any>['header'];
}) =>
  createDatesList(header)({
    container,
    attribute: 'created_at_timestamp',
    items: DATE_RANGES,
  });
