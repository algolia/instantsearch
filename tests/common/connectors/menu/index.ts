import type { MenuWidget } from 'instantsearch.js/es/widgets/menu/menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<MenuWidget>[0];
export type MenuConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createMenuConnectorTests(
  setup: MenuConnectorSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Menu connector common tests', () => {
    createRoutingTests(setup, act);
  });
}
