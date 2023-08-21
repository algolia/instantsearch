/**
 * @jest-environment jsdom
 */

import { runTestSuites } from '@instantsearch/tests';
import * as suites from '@instantsearch/tests/widgets';

import instantsearch from '../index.es';
import {
  hierarchicalMenu,
  breadcrumb,
  menu,
  refinementList,
  pagination,
  infiniteHits,
  searchBox,
  hits,
  index,
  rangeInput,
  hitsPerPage,
} from '../widgets';

import type { TestOptionsMap, TestSetupsMap } from '@instantsearch/tests';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;

const testSetups: TestSetupsMap<TestSuites> = {
  createHierarchicalMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        hierarchicalMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
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
  createBreadcrumbWidgetTests({ instantSearchOptions, widgetParams }) {
    const { transformItems, templates, ...hierarchicalWidgetParams } =
      widgetParams;

    instantsearch(instantSearchOptions)
      .addWidgets([
        breadcrumb({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
        }),
        hierarchicalMenu({
          container: document.body.appendChild(document.createElement('div')),
          ...hierarchicalWidgetParams,
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
  createRefinementListWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        refinementList({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
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
  createMenuWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        menu({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
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
  createPaginationWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        pagination({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
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
  createInfiniteHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        searchBox({
          container: document.body.appendChild(document.createElement('div')),
        }),
        infiniteHits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'main-hits',
            })
          ),
          templates: {
            item: (hit, { html, sendEvent }) =>
              html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
                ${hit.objectID}
                <button
                  data-testid=${`main-hits-convert-${hit.__position}`}
                  onClick=${() => sendEvent('conversion', hit, 'Converted')}
                >
                  convert
                </button>
                <button
                  data-testid=${`main-hits-click-${hit.__position}`}
                  onClick=${() => sendEvent('click', hit, 'Clicked')}
                >
                  click
                </button>
              </div>`,
          },
          ...widgetParams,
        }),
        index({ indexName: 'nested' }).addWidgets([
          infiniteHits({
            container: document.body.appendChild(
              Object.assign(document.createElement('div'), {
                id: 'nested-hits',
              })
            ),
            templates: {
              item: (hit, { html, sendEvent }) =>
                html`<div
                  data-testid=${`nested-hits-top-level-${hit.__position}`}
                >
                  ${hit.objectID}
                  <button
                    data-testid=${`nested-hits-click-${hit.__position}`}
                    onClick=${() => sendEvent('click', hit, 'Clicked nested')}
                  >
                    click
                  </button>
                </div>`,
            },
          }),
        ]),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createHitsWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        searchBox({
          container: document.body.appendChild(document.createElement('div')),
        }),
        hits({
          container: document.body.appendChild(
            Object.assign(document.createElement('div'), {
              id: 'main-hits',
            })
          ),
          templates: {
            item: (hit, { html, sendEvent }) =>
              html`<div data-testid=${`main-hits-top-level-${hit.__position}`}>
                ${hit.objectID}
                <button
                  data-testid=${`main-hits-convert-${hit.__position}`}
                  onClick=${() => sendEvent('conversion', hit, 'Converted')}
                >
                  convert
                </button>
                <button
                  data-testid=${`main-hits-click-${hit.__position}`}
                  onClick=${() => sendEvent('click', hit, 'Clicked')}
                >
                  click
                </button>
              </div>`,
          },
          ...widgetParams,
        }),
        index({ indexName: 'nested' }).addWidgets([
          hits({
            container: document.body.appendChild(
              Object.assign(document.createElement('div'), {
                id: 'nested-hits',
              })
            ),
            templates: {
              item: (hit, { html, sendEvent }) =>
                html`<div data-testid=${`nested-hits-${hit.__position}`}>
                  ${hit.objectID}
                  <button
                    data-testid=${`nested-hits-click-${hit.__position}`}
                    onClick=${() => sendEvent('click', hit, 'Clicked nested')}
                  >
                    click
                  </button>
                </div>`,
            },
          }),
        ]),
      ])
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();
  },
  createRangeInputWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        rangeInput({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
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
  createInstantSearchWidgetTests({ instantSearchOptions }) {
    instantsearch(instantSearchOptions)
      .on('error', () => {
        /*
         * prevent rethrowing InstantSearch errors, so tests can be asserted.
         * IRL this isn't needed, as the error doesn't stop execution.
         */
      })
      .start();

    return {
      algoliaAgents: [
        `instantsearch.js (${
          require('../../../instantsearch.js/package.json').version
        })`,
      ],
    };
  },
  createHitsPerPageWidgetTests({ instantSearchOptions, widgetParams }) {
    instantsearch(instantSearchOptions)
      .addWidgets([
        hitsPerPage({
          container: document.body.appendChild(document.createElement('div')),
          ...widgetParams,
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
  createRefinementListWidgetTests: undefined,
  createHierarchicalMenuWidgetTests: undefined,
  createBreadcrumbWidgetTests: undefined,
  createMenuWidgetTests: undefined,
  createPaginationWidgetTests: undefined,
  createInfiniteHitsWidgetTests: undefined,
  createHitsWidgetTests: undefined,
  createRangeInputWidgetTests: undefined,
  createInstantSearchWidgetTests: undefined,
  createHitsPerPageWidgetTests: undefined,
};

describe('Common widget tests (InstantSearch.js)', () => {
  runTestSuites({
    testSuites,
    testSetups,
    testOptions,
  });
});
