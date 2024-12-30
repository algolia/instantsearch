import { fakeAct } from '../../common';

import { createOptionsTests } from './options';
import { createStateTests } from './state';

import type { TestOptions, TestSetup } from '../../common';
import type { FrequentlyBoughtTogetherConnectorParams } from 'instantsearch-core';

export type FrequentlyBoughtTogetherConnectorSetup = TestSetup<{
  widgetParams: FrequentlyBoughtTogetherConnectorParams;
}>;

export function createFrequentlyBoughtTogetherConnectorTests(
  setup: FrequentlyBoughtTogetherConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('FrequentlyBoughtTogether connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
    createStateTests(setup, { act, skippedTests });
  });
}
