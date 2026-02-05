import { fakeAct } from '../../common';

import { createRoutingTests } from './routing';

import type { TestOptions, TestSetup } from '../../common';
import type { MenuWidget } from 'instantsearch.js/es/widgets/menu/menu';

type WidgetParams = Parameters<MenuWidget>[0];
export type MenuConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createMenuConnectorTests(
  setup: MenuConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Menu connector common tests', () => {
    createRoutingTests(setup, { act, skippedTests, flavor });
  });
}
