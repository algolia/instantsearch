import type { HitsPerPageWidget } from 'instantsearch.js/es/widgets/hits-per-page/hits-per-page';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<HitsPerPageWidget>[0];
export type HitsPerPageSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsPerPageTests(
  setup: HitsPerPageSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HitsPerPage common tests', () => {
    createRoutingTests(setup, act);
  });
}
