import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createShowMoreTests } from './show-more';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
  vueSlots?: Record<string, unknown>;
}>;

export function createHierarchicalMenuTests(
  setup: HierarchicalMenuSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HierarchicalMenu common tests', () => {
    createOptimisticUiTests(setup, act);
    createShowMoreTests(setup, act);
  });
}
