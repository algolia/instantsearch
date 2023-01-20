import type { MenuWidget } from 'instantsearch.js/es/widgets/menu/menu';
import type { TestSetup } from '../../common';
import { createOptimisticUiTests } from './optimistic-ui';

type WidgetParams = Parameters<MenuWidget>[0];
export type MenuSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createMenuTests(setup: MenuSetup) {
  describe('Menu common tests', () => {
    createOptimisticUiTests(setup);
  });
}
