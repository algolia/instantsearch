/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/shared-composition';

import instantsearch from '../index.es';
import { refinementList } from '../widgets';

import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites, 'javascript'> = {
  createSharedCompositionTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        refinementList({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.refinementList,
        }),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
};

const testOptions: TestOptionsMap<TestSuites> = {
  createSharedCompositionTests: undefined,
};

describe('Common shared composition tests (InstantSearch.js)', () => {
  runTestSuites({
    flavor: 'javascript',
    testSuites,
    testSetups,
    testOptions,
  });
});
