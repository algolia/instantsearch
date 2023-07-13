/**
 * @jest-environment jsdom
 */

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
} from '../widgets';

type TestSuites = typeof suites;
const testSuites: TestSuites = suites;
type TestSetups = {
  [key in keyof TestSuites]: Parameters<TestSuites[key]>[0];
};

const setups: TestSetups = {
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
};

describe('Common shared tests (InstantSearch.js)', () => {
  test('has all the tests', () => {
    expect(Object.keys(setups).sort()).toEqual(Object.keys(testSuites).sort());
  });

  Object.keys(testSuites).forEach((testName) => {
    // @ts-ignore (typescript is only referentially typed)
    // https://github.com/microsoft/TypeScript/issues/38520
    testSuites[testName](setups[testName]);
  });
});
