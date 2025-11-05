import { fakeAct, skippableDescribe } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { NumericMenuWidget } from 'instantsearch.js/es/widgets/numeric-menu/numeric-menu';

type WidgetParams = Parameters<NumericMenuWidget>[0];
export type NumericMenuWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createNumericMenuWidgetTests(
  setup: NumericMenuWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('NumericMenu widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createLinksTests(setup, { act, skippedTests, flavor });
  });
}
