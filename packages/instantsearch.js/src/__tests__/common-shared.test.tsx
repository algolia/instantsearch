/**
 * @jest-environment jsdom
 */
import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/shared';

import { connectMenu, connectPagination } from '../connectors';
import instantsearch from '../index.es';
import {
  menu,
  pagination,
  hits,
  hierarchicalMenu,
  breadcrumb,
} from '../widgets';

import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites> = {
  createSharedTests({ instantSearchOptions, widgetParams }) {
    const menuURL = connectMenu<{ container: HTMLElement }>((renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Menu-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
      `;
    });
    const paginationURL = connectPagination<{ container: HTMLElement }>(
      (renderOptions) => {
        renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="Pagination-link"
          href="${renderOptions.createURL(10)}"
        >
          LINK
        </a>
      `;
      }
    );

    instantsearch(instantSearchOptions)
      .addWidgets([
        menuURL({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.menu,
        }),
        hierarchicalMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.hierarchicalMenu,
        }),
        menu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.menu,
        }),
        breadcrumb({
          container: document.body.appendChild(document.createElement('div')),
          attributes: widgetParams.hierarchicalMenu.attributes,
        }),
        hits({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.hits,
        }),
        paginationURL({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.pagination,
        }),
        pagination({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams.pagination,
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
  createSharedTests: undefined,
};

describe('Common shared tests (InstantSearch.js)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
