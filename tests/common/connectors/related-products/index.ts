import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { RelatedProductsConnectorParams } from 'instantsearch.js/src/connectors/related-products/connectRelatedProducts';

export type RelatedProductsConnectorSetup = TestSetup<{
  widgetParams: RelatedProductsConnectorParams;
}>;

export function createRelatedProductsConnectorTests(
  setup: RelatedProductsConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('RelatedProducts connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
