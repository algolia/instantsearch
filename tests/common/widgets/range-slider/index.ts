import { fakeAct } from '../../common';

import { createBehaviourTests } from './behaviour';
import { createLinksTests } from './links';
import { createOptionsTests } from './options';

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

  describe('RangeSlider widget common tests', () => {
    createBehaviourTests(setup, { act, skippedTests, flavor });
    createOptionsTests(setup, { act, skippedTests, flavor });
    createLinksTests(setup, { act, skippedTests, flavor });
  });
}
