import type { InfiniteHitsWidget } from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';
import type { TestOptions, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createInsightsTests } from './insights';

type WidgetParams = Parameters<InfiniteHitsWidget>[0];
export type InfiniteHitsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createInfiniteHitsWidgetTests(
  setup: InfiniteHitsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InfiniteHits widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests });
    createInsightsTests(setup, { act, skippedTests });
  });
}
