import type { RangeInputWidget } from 'instantsearch.js/es/widgets/range-input/range-input';
import type { TestSetup, Act } from '../../common';
import { fakeAct } from '../../common';
import { createBehaviourTests } from './behaviour';

type WidgetParams = Parameters<RangeInputWidget>[0];
export type RangeInputSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRangeInputTests(
  setup: RangeInputSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RangeInput common tests', () => {
    createBehaviourTests(setup, act);
  });
}
