import { fakeAct } from '../../common';

import { createAlgoliaAgentTests } from './algolia-agent';

import type { TestOptions, TestSetup } from '../../common';

export type InstantSearchWidgetSetup = TestSetup<
  Record<string, unknown>,
  {
    algoliaAgents: string[];
  }
>;

export function createInstantSearchWidgetTests(
  setup: InstantSearchWidgetSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InstantSearch widget common tests', () => {
    createAlgoliaAgentTests(setup, { act, skippedTests, flavor });
  });
}
