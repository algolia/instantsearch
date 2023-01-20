import type { TestSetup } from '../common';
import { createOptimisticUiTests } from './optimistic-ui';

export type PaginationSetup = TestSetup;

export function createPaginationTests(setup: PaginationSetup) {
  describe('Pagination common tests', () => {
    createOptimisticUiTests(setup);
  });
}
