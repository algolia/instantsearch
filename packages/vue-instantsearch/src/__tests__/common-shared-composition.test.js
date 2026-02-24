/**
 * @jest-environment @instantsearch/testutils/jest-environment-jsdom.ts
 */
import { runTestSuites } from '@instantsearch/tests/common';
import * as testSuites from '@instantsearch/tests/shared-composition';

import { nextTick, mountApp } from '../../test/utils';
import { AisInstantSearch, AisRefinementList } from '../instantsearch';
import { renderCompat } from '../util/vue-compat';
jest.unmock('instantsearch.js/es');

const testSetups = {
  async createSharedCompositionTests({ instantSearchOptions, widgetParams }) {
    mountApp(
      {
        render: renderCompat((h) =>
          h(AisInstantSearch, { props: instantSearchOptions }, [
            h(AisRefinementList, { props: widgetParams.refinementList }),
          ])
        ),
      },
      document.body.appendChild(document.createElement('div'))
    );

    await nextTick();
  },
};

const testOptions = {
  createSharedCompositionTests: undefined,
};

describe('Common shared composition tests (Vue InstantSearch)', () => {
  runTestSuites({
    flavor: 'vue',
    testSuites,
    testSetups,
    testOptions,
  });
});
