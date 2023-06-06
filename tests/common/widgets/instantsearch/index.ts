import type { Act, TestSetup } from '../../common';
import { fakeAct } from '../../common';
import { createAlgoliaAgentTests } from './algolia-agent';

export type InstantSearchSetup = TestSetup<
  Record<string, unknown>,
  {
    algoliaAgents: string[];
  }
>;

export function createInstantSearchTests(
  setup: InstantSearchSetup,
  act: Act = fakeAct
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InstantSearch common tests', () => {
    createAlgoliaAgentTests(setup, act);
  });
}
