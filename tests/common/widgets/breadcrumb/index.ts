import type { BreadcrumbWidget } from 'instantsearch.js/es/widgets/breadcrumb/breadcrumb';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createOptionsTests } from './options';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<BreadcrumbWidget>[0];
export type BreadcrumbSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createBreadcrumbTests(
  setup: BreadcrumbSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Breadcrumb common tests', () => {
    createOptimisticUiTests(setup, act);
    createOptionsTests(setup, act);
    createRoutingTests(setup, act);
  });
}
