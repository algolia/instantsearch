import { fakeAct } from '../common';

import { createInsightsTests } from './insights';
import { createInteractionTests } from './interaction';
import { createRoutingTests } from './routing';

import type { TestOptions, TestSetup } from '../common';
import type { HierarchicalMenuWidget } from 'instantsearch.js/es/widgets/hierarchical-menu/hierarchical-menu';
import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';
import type { MenuWidget } from 'instantsearch.js/es/widgets/menu/menu';
import type { PaginationWidget } from 'instantsearch.js/es/widgets/pagination/pagination';

export type SharedSetup = TestSetup<{
  widgetParams: {
    menu: Omit<Parameters<MenuWidget>[0], 'container'>;
    hits: Omit<Parameters<HitsWidget>[0], 'container'>;
    pagination: Omit<Parameters<PaginationWidget>[0], 'container'>;
    hierarchicalMenu: Omit<Parameters<HierarchicalMenuWidget>[0], 'container'>;
  };
}>;

export function createSharedTests(
  setup: SharedSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Shared common tests', () => {
    createRoutingTests(setup, { act, skippedTests, flavor });
    createInsightsTests(setup, { act, skippedTests, flavor });
    createInteractionTests(setup, { act, skippedTests, flavor });
  });
}
