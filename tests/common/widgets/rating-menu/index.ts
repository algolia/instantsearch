import { fakeAct, skippableDescribe } from '../../common';

import { createBehaviourTests } from './behaviour';

import type { TestOptions, TestSetup } from '../../common';
import type { RatingMenuWidget } from 'instantsearch.js/es/widgets/rating-menu/rating-menu';

type WidgetParams = Parameters<RatingMenuWidget>[0];
export type RatingMenuWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRatingMenuWidgetTests(
  setup: RatingMenuWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  skippableDescribe('RatingMenu widget common tests', skippedTests, () => {
    createBehaviourTests(setup, { act, skippedTests });
  });
}
