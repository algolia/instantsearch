import type { MenuWidget } from 'instantsearch.js/es/widgets/menu/menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<MenuWidget>[0];
export type MenuWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createMenuWidgetTests(
  setup: MenuWidgetSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Menu widget common tests', () => {
    createOptimisticUiTests(setup, act);
  });
}
