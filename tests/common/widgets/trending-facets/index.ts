import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { TrendingFacetsWidget } from 'instantsearch.js/es/widgets/trending-facets/trending-facets';

type WidgetParams = Parameters<TrendingFacetsWidget>[0];
export type TrendingFacetsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createTrendingFacetsWidgetTests(
  setup: TrendingFacetsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('TrendingFacets widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
