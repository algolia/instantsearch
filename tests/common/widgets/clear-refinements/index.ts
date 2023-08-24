import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ClearRefinementsWidget } from 'instantsearch.js/es/widgets/clear-refinements/clear-refinements';

type WidgetParams = Parameters<ClearRefinementsWidget>[0];
export type ClearRefinementsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createClearRefinementsWidgetTests(
  setup: ClearRefinementsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ClearRefinements widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
