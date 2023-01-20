import type { RefinementListWidget } from 'instantsearch.js/es/widgets/refinement-list/refinement-list';
import type { TestSetup } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<RefinementListWidget>[0];
export type RefinementListSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRefinementListTests(setup: RefinementListSetup) {
  describe('RefinementList common tests', () => {
    createOptimisticUiTests(setup);
  });
}
