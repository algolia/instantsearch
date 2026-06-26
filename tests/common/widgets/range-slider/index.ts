import { fakeAct, skippableDescribe } from '../../common';

import { createBehaviourTests } from './behaviour';

import type { TestOptions, TestSetup } from '../../common';
import type { RangeSliderWidget } from 'instantsearch.js/es/widgets/range-slider/range-slider';

type WidgetParams = Parameters<RangeSliderWidget>[0];
export type RangeSliderWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRangeSliderWidgetTests(
  setup: RangeSliderWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('RangeSlider widget common tests', skippedTests, () => {
    createBehaviourTests(setup, { act, skippedTests, flavor });
  });
}
