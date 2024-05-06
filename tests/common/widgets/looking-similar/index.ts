import { fakeAct, skippableDescribe } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { LookingSimilarWidget } from 'instantsearch.js/es/widgets/looking-similar/looking-similar';

type WidgetParams = Parameters<LookingSimilarWidget>[0];
export type LookingSimilarWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createLookingSimilarTests(
  setup: LookingSimilarWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('LookingSimilar widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
