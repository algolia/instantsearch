import { fakeAct, skippableDescribe } from '../../common';

import { createLinksTests } from './links';
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

  skippableDescribe('RelatedProducts widget common tests', skippedTests, () => {
    createOptionsTests(setup, { act, skippedTests });
    createLinksTests(setup, { act, skippedTests });
  });
}
