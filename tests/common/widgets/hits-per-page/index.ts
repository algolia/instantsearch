import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { HitsPerPageWidget } from 'instantsearch.js/es/widgets/hits-per-page/hits-per-page';

type WidgetParams = Parameters<HitsPerPageWidget>[0];
export type HitsPerPageWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsPerPageWidgetTests(
  setup: HitsPerPageWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HitsPerPage widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
