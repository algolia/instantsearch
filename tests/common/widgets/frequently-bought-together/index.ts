import { fakeAct, skippableDescribe } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { FrequentlyBoughtTogetherWidget } from 'instantsearch.js/es/widgets/frequently-bought-together/frequently-bought-together';

type WidgetParams = Parameters<FrequentlyBoughtTogetherWidget>[0];
export type FrequentlyBoughtTogetherWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createFrequentlyBoughtTogetherWidgetTests(
  setup: FrequentlyBoughtTogetherWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe(
    'FrequentlyBoughtTogether widget common tests',
    skippedTests,
    () => {
      createOptionsTests(setup, { act, skippedTests, flavor });
      createLinksTests(setup, { act, skippedTests, flavor });
    }
  );
}
