import type { RefinementListWidget } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import type { TestSetup, Act } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createShowMoreTests } from './show-more';

type WidgetParams = Parameters<RefinementListWidget>[0];
export type RefinementListSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
  vueSlots?: Record<string, unknown>;
}>;

export function createRefinementListTests(
  setup: RefinementListSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RefinementList common tests', () => {
    createOptimisticUiTests(setup, act);
    createShowMoreTests(setup, act);
  });
}
