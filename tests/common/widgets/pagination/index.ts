import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<PaginationWidget>[0];
export type PaginationSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createPaginationTests(
  setup: PaginationSetup,
  act: Act = fakeAct
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('Pagination common tests', () => {
    createOptimisticUiTests(setup, act);
    createRoutingTests(setup, act);
  });
}
