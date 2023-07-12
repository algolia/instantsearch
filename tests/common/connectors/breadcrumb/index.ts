import type { BreadcrumbWidget } from 'instantsearch.js/es/widgets/breadcrumb/breadcrumb';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<BreadcrumbWidget>[0];
export type BreadcrumbConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createBreadcrumbConnectorTests(
  setup: BreadcrumbConnectorSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Breadcrumb connector common tests', () => {
    createRoutingTests(setup, act);
  });
}
