import type { NumericMenuWidget } from 'instantsearch.js/es/widgets/numeric-menu/numeric-menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<NumericMenuWidget>[0];
export type NumericMenuConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createNumericMenuConnectorTests(
  setup: NumericMenuConnectorSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('NumericMenu connector common tests', () => {
    createRoutingTests(setup, act);
  });
}
