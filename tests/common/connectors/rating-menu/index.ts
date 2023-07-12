import type { RatingMenuWidget } from 'instantsearch.js/es/widgets/rating-menu/rating-menu';
import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createRoutingTests } from './routing';

type WidgetParams = Parameters<RatingMenuWidget>[0];
export type RatingMenuConnectorSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRatingMenuConnectorTests(
  setup: RatingMenuConnectorSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RatingMenu connector common tests', () => {
    createRoutingTests(setup, act);
  });
}
