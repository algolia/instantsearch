import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { ToggleRefinementWidget } from 'instantsearch.js/es/widgets/toggle-refinement/toggle-refinement';

type WidgetParams = Parameters<ToggleRefinementWidget>[0];
export type ToggleRefinementWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createToggleRefinementWidgetTests(
  setup: ToggleRefinementWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('ToggleRefinement widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
  });
}
