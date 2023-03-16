import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createInsightsTests } from './insights';

type WidgetParams = Parameters<HitsWidget>[0];
export type HitsSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsTests(setup: HitsSetup, act: Act = fakeAct) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hits common tests', () => {
    createInsightsTests(setup, act);
  });
}
