import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';
import type { TestSetup } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<PaginationWidget>[0];
export type PaginationSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createPaginationTests(setup: PaginationSetup) {
  describe('Pagination common tests', () => {
    createOptimisticUiTests(setup);
  });
}
