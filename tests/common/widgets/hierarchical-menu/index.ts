import { fakeAct } from '../../common';

import { createEdgeCasesTests } from './edge-cases';
import { createLinksTests } from './links';
import { createOptimisticUiTests } from './optimistic-ui';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHierarchicalMenuWidgetTests(
  setup: HierarchicalMenuWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HierarchicalMenu widget common tests', () => {
    createOptimisticUiTests(setup, { act, skippedTests, flavor });
    createOptionsTests(setup, { act, skippedTests, flavor });
    createLinksTests(setup, { act, skippedTests, flavor });
    createEdgeCasesTests(setup, { act, skippedTests, flavor });
  });
}
