import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createAlgoliaAgentTests } from './algolia-agent';

export type InstantSearchWidgetSetup = TestSetup<
  Record<string, unknown>,
  {
    algoliaAgents: string[];
  }
>;

export function createInstantSearchWidgetTests(
  setup: InstantSearchWidgetSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InstantSearch widget common tests', () => {
    createAlgoliaAgentTests(setup, act);
  });
}
