import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
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
    createRoutingTests(setup, act);
  });
}
