import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<PaginationWidget>[0];
export type PaginationConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createPaginationConnectorTests(
  setup: PaginationConnectorSetup,
  act: Act = fakeAct
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('Pagination connector common tests', () => {
    createRoutingTests(setup, act);
  });
}
