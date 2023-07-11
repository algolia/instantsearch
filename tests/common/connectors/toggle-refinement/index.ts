import type { ToggleRefinementWidget } from 'instantsearch.js/es/widgets/toggle-refinement/toggle-refinement';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<ToggleRefinementWidget>[0];
export type ToggleRefinementConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createToggleRefinementConnectorTests(
  setup: ToggleRefinementConnectorSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ToggleRefinement connector common tests', () => {
    createRoutingTests(setup, act);
  });
}
