import { fakeAct } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { PoweredByWidget } from 'instantsearch.js/es/widgets/powered-by/powered-by';

type WidgetParams = Parameters<PoweredByWidget>[0];
export type PoweredByWidgetSetup = TestSetup<
  {
    widgetParams: Omit<WidgetParams, 'container'>;
  },
  {
    flavor: string;
  }
>;

export function createPoweredByWidgetTests(
  setup: PoweredByWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('PoweredBy widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
    createLinksTests(setup, { act, skippedTests });
  });
}
