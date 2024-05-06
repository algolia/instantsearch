import { fakeAct } from '../../common';

import { createOptionsTests } from './options';

import type { TestOptions, TestSetup } from '../../common';
import type { LookingSimilarConnectorParams } from 'instantsearch.js/src/connectors/looking-similar/connectLookingSimilar';

export type LookingSimilarConnectorSetup = TestSetup<{
  widgetParams: LookingSimilarConnectorParams;
}>;

export function createLookingSimilarConnectorTests(
  setup: LookingSimilarConnectorSetup,
  { act = fakeAct, skippedTests = {} }: TestOptions = {}
) {
  beforeAll(() => {
    document.body.innerHTML = '';
  });

  describe('LookingSimilar connector common tests', () => {
    createOptionsTests(setup, { act, skippedTests });
  });
}
