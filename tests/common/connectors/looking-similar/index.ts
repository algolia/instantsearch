import { fakeAct } from '../../common';

import { createOptionsTests } from './options';
import { createStateTests } from './state';

import type { TestOptions, TestSetup } from '../../common';
import type { LookingSimilarConnectorParams } from 'instantsearch-core';

export type LookingSimilarConnectorSetup = TestSetup<{
  widgetParams: LookingSimilarConnectorParams;
}>;

export function createLookingSimilarConnectorTests(
  setup: LookingSimilarConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('LookingSimilar connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createStateTests(setup, { act, skippedTests, flavor });
  });
}
