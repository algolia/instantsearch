import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createInsightsTests } from './insights';

type WidgetParams = Parameters<HitsWidget>[0];
export type HitsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsWidgetTests(
  setup: HitsWidgetSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hits widget common tests', () => {
    createInsightsTests(setup, act);
  });
}
