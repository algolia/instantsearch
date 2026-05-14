import { fakeAct } from '../../common';

import { createOptionsTests } from './options';
import { createStateTests } from './state';

import type { TestOptions, TestSetup } from '../../common';
import type { TrendingFacetsConnectorParams } from 'instantsearch.js/src/connectors/trending-facets/connectTrendingFacets';

export type TrendingFacetsConnectorSetup = TestSetup<{
  widgetParams: TrendingFacetsConnectorParams;
}>;

export function createTrendingFacetsConnectorTests(
  setup: TrendingFacetsConnectorSetup,
  { act = fakeAct, skippedTests = {}, flavor = 'javascript' }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('TrendingFacets connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests, flavor });
    createStateTests(setup, { act, skippedTests, flavor });
  });
}
