import type { TestSetup } from '../common';
import { createOptimisticUiTests } from './optimistic-ui';

export type MenuSetup = TestSetup<{ attribute: string }>;

export function createMenuTests(setup: MenuSetup) {
  describe('Menu common tests', () => {
    createOptimisticUiTests(setup);
  });
}
