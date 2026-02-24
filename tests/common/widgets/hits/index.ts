import { fakeAct } from '../../common';

import { createInsightsTests } from './insights';
import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';

type WidgetParams = Parameters<HitsWidget>[0];
export type HitsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsWidgetTests(
  setup: HitsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hits widget common tests', () => {
    createInsightsTests(setup, { act, skippedTests, flavor });
    createOptionsTests(setup, { act, skippedTests, flavor });
    createLinksTests(setup, { act, skippedTests, flavor });
  });
}
