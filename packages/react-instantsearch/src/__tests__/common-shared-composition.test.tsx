/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/shared-composition';
import { act, render } from '@testing-library/react';
import React from 'react';

import { InstantSearch, RefinementList } from '..';

import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites, 'react'> = {
  createSharedCompositionTests({ instantSearchOptions, widgetParams }) {
    render(
      <InstantSearch {...instantSearchOptions}>
        <RefinementList {...widgetParams.refinementList} />
      </InstantSearch>
    );
  },
};

const testOptions: TestOptionsMap<TestSuites> = {
  createSharedCompositionTests: { act },
};

describe('Common shared composition tests (React InstantSearch)', () => {
  runTestSuites({
    flavor: 'react',
    testSuites,
    testSetups,
    testOptions,
  });
});
