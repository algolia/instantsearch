import { fakeAct } from '../../common';

import { createInsightsTests } from './insights';
import { createLinksTests } from './links';
import { createOptimisticUiTests } from './optimistic-ui';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { InfiniteHitsWidget } from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';

type WidgetParams = Parameters<InfiniteHitsWidget>[0];
export type InfiniteHitsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createInfiniteHitsWidgetTests(
  setup: InfiniteHitsWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InfiniteHits widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests, flavor });
    createInsightsTests(setup, { act, skippedTests, flavor });
    createOptionsTests(setup, { act, skippedTests, flavor });
    createLinksTests(setup, { act, skippedTests, flavor });
  });
}
