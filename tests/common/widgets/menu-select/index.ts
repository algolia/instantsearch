import { fakeAct, skippableDescribe } from '../../common';

import { createLinksTests } from './links';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { MenuSelectWidget } from 'instantsearch.js/es/widgets/menu-select/menu-select';

type WidgetParams = Parameters<MenuSelectWidget>[0];
export type MenuSelectWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createMenuSelectWidgetTests(
  setup: MenuSelectWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('MenuSelect widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
    createLinksTests(setup, { act, skippedTests });
  });
}
