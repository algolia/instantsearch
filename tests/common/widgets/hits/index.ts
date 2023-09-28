import { fakeAct } from '../../common';

import { createInsightsTests } from './insights';
import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { HitsWidget } from 'instantsearch.js/es/widgets/hits/hits';

type WidgetParams = Parameters<HitsWidget>[0];
export type HitsWidgetSetup = TestSetup<{
  widgetParams: Omit<WidgetParams, 'container'>;
}>;

export function createHitsWidgetTests(
  setup: HitsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hits widget common Insights tests', () => {
    createInsightsTests(setup, { act, skippedTests });
  });
}

export function createHitsWidgetOptionsTests(
  setup: HitsWidgetSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  describe('Hits widget common option tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
