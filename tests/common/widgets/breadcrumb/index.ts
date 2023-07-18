import type { BreadcrumbWidget } from 'instantsearch.js/es/widgets/breadcrumb/breadcrumb';
import type { TestOptions, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createOptionsTests } from './options';

type WidgetParams = Parameters<BreadcrumbWidget>[0];
export type BreadcrumbWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createBreadcrumbWidgetTests(
  setup: BreadcrumbWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Breadcrumb widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests });
    createOptionsTests(setup, { act, skippedTests });
  });
}
