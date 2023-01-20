import type { RefinementListWidget } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import type { TestSetup, Act } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<RefinementListWidget>[0];
export type RefinementListSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRefinementListTests(
  setup: RefinementListSetup,
  act: Act = fakeAct
) {
  describe('RefinementList common tests', () => {
    createOptimisticUiTests(setup, act);
  });
}
