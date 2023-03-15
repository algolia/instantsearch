import type { InfiniteHitsWidget } from 'instantsearch.js/es/widgets/infinite-hits/infinite-hits';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createInsightsTests } from './insights';

type WidgetParams = Parameters<InfiniteHitsWidget>[0];
export type InfiniteHitsSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createInfiniteHitsTests(
  setup: InfiniteHitsSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InfiniteHits common tests', () => {
    createOptimisticUiTests(setup, act);
    createInsightsTests(setup, act);
  });
}
