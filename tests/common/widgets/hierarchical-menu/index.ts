import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';
import type { TestSetup } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHierarchicalMenuTests(setup: HierarchicalMenuSetup) {
  describe('HierarchicalMenu common tests', () => {
    createOptimisticUiTests(setup);
  });
}
