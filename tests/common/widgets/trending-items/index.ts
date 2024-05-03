import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { TrendingItemsWidget } from 'instantsearch.js/es/widgets/trending-items/trending-items';

type WidgetParams = Parameters<TrendingItemsWidget>[0];
export type TrendingItemsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createTrendingItemsWidgetTests(
  setup: TrendingItemsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('TrendingItems widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
