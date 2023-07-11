import type { RangeInputWidget } from 'instantsearch.js/es/widgets/range-input/range-input';
import type { TestSetup, Act } from '../../common';
import { fakeAct } from '../../common';
import { createBehaviourTests } from './behaviour';

type WidgetParams = Parameters<RangeInputWidget>[0];
export type RangeInputWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRangeInputWidgetTests(
  setup: RangeInputWidgetSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RangeInput widget common tests', () => {
    createBehaviourTests(setup, act);
  });
}
