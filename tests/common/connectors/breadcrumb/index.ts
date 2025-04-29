import { fakeAct } from '../../common';

import { createRoutingTests } from './routing';

import type { TestOptions, TestSetup } from '../../common';
import type { BreadcrumbWidget } from 'instantsearch.js/es/widgets/breadcrumb/breadcrumb';

type WidgetParams = Parameters<BreadcrumbWidget>[0];
export type BreadcrumbConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createBreadcrumbConnectorTests(
  setup: BreadcrumbConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Breadcrumb connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests });
  });
}
