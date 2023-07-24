import { fakeAct } from '../../common';

import { createInsightsTests } from './insights';

import type { TestOptions, TestSetup } from '../../common';
import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';

type WidgetParams = Parameters<HitsWidget>[0];
export type HitsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsWidgetTests(
  setup: HitsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hits widget common tests', () => {
    createInsightsTests(setup, { act, skippedTests });
  });
}
