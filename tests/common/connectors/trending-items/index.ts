import { fakeAct } from '../../common';

import { createOptionsTests } from './options';
import { createStateTests } from './state';

import type { TestOptions, TestSetup } from '../../common';
import type { TrendingItemsConnectorParams } from 'instantsearch-core';

export type TrendingItemsConnectorSetup = TestSetup<{
  widgetParams: TrendingItemsConnectorParams;
}>;

export function createTrendingItemsConnectorTests(
  setup: TrendingItemsConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('TrendingItems connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
    createStateTests(setup, { act, skippedTests });
  });
}
