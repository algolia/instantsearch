import { fakeAct } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { DynamicWidgetsWidget } from 'instantsearch.js/es/widgets/dynamic-widgets/dynamic-widgets';

type WidgetParams = Parameters<DynamicWidgetsWidget>[0];
export type DynamicWidgetsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container' | 'widgets' | 'fallbackWidget'>;
}>;

export function createDynamicWidgetsWidgetTests(
  setup: DynamicWidgetsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('DynamicWidgets widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
    createLinksTests(setup, { act, skippedTests });
  });
}
