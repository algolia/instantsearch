import { fakeAct } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { SortByWidget } from 'instantsearch.js/es/widgets/sort-by/sort-by';

type WidgetParams = Parameters<SortByWidget>[0];
export type SortByWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createSortByWidgetTests(
  setup: SortByWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('SortBy widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createLinksTests(setup, { act, skippedTests, flavor });
  });
}
