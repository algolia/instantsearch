import { fakeAct } from '../../common';

import { createBehaviourTests } from './behaviour';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { RangeInputWidget } from 'instantsearch.js/es/widgets/range-input/range-input';

type WidgetParams = Parameters<RangeInputWidget>[0];
export type RangeInputWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRangeInputWidgetTests(
  setup: RangeInputWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RangeInput widget common tests', () => {
    createBehaviourTests(setup, { act, skippedTests });
    createOptionsTests(setup, { act, skippedTests });
  });
}
