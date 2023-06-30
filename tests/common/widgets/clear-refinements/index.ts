import type { ClearRefinementsWidget } from 'instantsearch.js/es/widgets/clear-refinements/clear-refinements';
import type { TestSetup } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<ClearRefinementsWidget>[0];
export type ClearRefinementsSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createClearRefinementsTests(setup: ClearRefinementsSetup) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ClearRefinements common tests', () => {
    createRoutingTests(setup);
  });
}
