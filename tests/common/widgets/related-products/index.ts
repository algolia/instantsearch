import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { RelatedProductsWidget } from 'instantsearch.js/es/widgets/related-products/related-products';

type WidgetParams = Parameters<RelatedProductsWidget>[0];
export type RelatedProductsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createRelatedProductsWidgetTests(
  setup: RelatedProductsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('RelatedProducts widget common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
