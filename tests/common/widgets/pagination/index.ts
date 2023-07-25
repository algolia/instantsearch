import { fakeAct } from '../../common';

import { createOptimisticUiTests } from './optimistic-ui';

import type { TestOptions, TestSetup } from '../../common';
import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';

type WidgetParams = Parameters<PaginationWidget>[0];
export type PaginationWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createPaginationWidgetTests(
  setup: PaginationWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('Pagination widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests });
  });
}
