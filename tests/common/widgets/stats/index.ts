import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { StatsWidget } from 'instantsearch.js/src/widgets/stats/stats';

type WidgetParams = Parameters<StatsWidget>[0];
export type StatsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createStatsWidgetTests(
  setup: StatsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Stats widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
