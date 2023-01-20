import type { TestSetup } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

export type RefinementListSetup = TestSetup<{ attribute: string }>;

export function createRefinementListTests(setup: RefinementListSetup) {
  describe('RefinementList common tests', () => {
    createOptimisticUiTests(setup);
  });
}
