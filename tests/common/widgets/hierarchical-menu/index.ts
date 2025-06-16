import { fakeAct } from '../../common';

import { createLinksTests } from './links';
import { createOptimisticUiTests } from './optimistic-ui';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
  vueSlots?: Record<string, unknown>;
}>;

export function createHierarchicalMenuWidgetTests(
  setup: HierarchicalMenuWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HierarchicalMenu widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests });
    createOptionsTests(setup, { act, skippedTests });
    createLinksTests(setup, { act, skippedTests });
  });
}
