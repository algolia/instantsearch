import { fakeAct } from '../../common';

import { createRoutingTests } from './routing';

import type { TestOptions, TestSetup } from '../../common';
import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';

type WidgetParams = Parameters<HierarchicalMenuWidget>[0];
export type HierarchicalMenuConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHierarchicalMenuConnectorTests(
  setup: HierarchicalMenuConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('HierarchicalMenu connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests });
  });
}
