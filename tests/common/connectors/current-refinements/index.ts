import type { CurrentRefinementsWidget } from 'instantsearch.js/es/widgets/current-refinements/current-refinements';
import type { Act, SkippedTests, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<CurrentRefinementsWidget>[0];
export type CurrentRefinementsConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createCurrentRefinementsConnectorTests(
  setup: CurrentRefinementsConnectorSetup,
  act: Act = fakeAct,
  { skippedTests = {} }: { skippedTests?: SkippedTests } = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('CurrentRefinements connector common tests', () => {
    createRoutingTests(setup, act, skippedTests);
  });
}
