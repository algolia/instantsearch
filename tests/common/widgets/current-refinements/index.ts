import { fakeAct } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { CurrentRefinementsWidget } from 'instantsearch.js/es/widgets/current-refinements/current-refinements';

type WidgetParams = Parameters<CurrentRefinementsWidget>[0];
export type CurrentRefinementsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createCurrentRefinementsWidgetTests(
  setup: CurrentRefinementsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('CurrentRefinements widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
    createLinksTests(setup, { act, skippedTests });
  });
}
