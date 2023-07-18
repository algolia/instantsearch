import type { TestOptions, TestSetup } from '../../common';
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
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('InstantSearch widget common tests', () => {
    createAlgoliaAgentTests(setup, { act, skippedTests });
  });
}
