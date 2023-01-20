import type { TestSetup } from '../common';
import { createOptimisticUiTests } from './optimistic-ui';

export type HierarchicalMenuSetup = TestSetup<{ attributes: string[] }>;

export function createHierarchicalMenuTests(setup: HierarchicalMenuSetup) {
  describe('HierarchicalMenu common tests', () => {
    createOptimisticUiTests(setup);
  });
}
