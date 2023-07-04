import type { ToggleRefinementWidget } from 'instantsearch.js/es/widgets/toggle-refinement/toggle-refinement';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<ToggleRefinementWidget>[0];
export type ToggleRefinementSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createToggleRefinementTests(
  setup: ToggleRefinementSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ToggleRefinement common tests', () => {
    createRoutingTests(setup, act);
  });
}
