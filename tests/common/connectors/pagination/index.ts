import { fakeAct } from '../../common';

import { createRoutingTests } from './routing';

import type { TestOptions, TestSetup } from '../../common';
import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';

type WidgetParams = Parameters<PaginationWidget>[0];
export type PaginationConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createPaginationConnectorTests(
  setup: PaginationConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('Pagination connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests, flavor });
  });
}
