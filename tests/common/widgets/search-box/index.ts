import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { SearchBoxWidget } from 'instantsearch.js/es/widgets/search-box/search-box';

type WidgetParams = Parameters<SearchBoxWidget>[0];
export type SearchBoxWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createSearchBoxWidgetTests(
  setup: SearchBoxWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('SearchBox widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
