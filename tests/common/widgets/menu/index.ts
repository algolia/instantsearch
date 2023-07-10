import type { MenuWidget } from 'instantsearch.js/es/widgets/menu/menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<MenuWidget>[0];
export type MenuSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createMenuTests(setup: MenuSetup, act: Act = fakeAct) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Menu common tests', () => {
    createOptimisticUiTests(setup, act);
    createRoutingTests(setup, act);
  });
}
