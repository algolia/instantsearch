/**
 * @jest-environment jsdom
 */
import {
  createHierarchicalMenuTests,
  createBreadcrumbTests,
  createRefinementListTests,
  createPaginationTests,
  createMenuTests,
  createInfiniteHitsTests,
  createHitsTests,
  createRangeInputTests,
  createInstantSearchTests,
} from '@instantsearch/tests';

import { connectRefinementList, connectPagination } from '../connectors';
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

createHierarchicalMenuTests(({ instantSearchOptions, widgetParams }) => {
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
});

createBreadcrumbTests(({ instantSearchOptions, widgetParams }) => {
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
});

createRefinementListTests(({ instantSearchOptions, widgetParams }) => {
  const refinementListURL = connectRefinementList<{ container: HTMLElement }>(
    (renderOptions) => {
      renderOptions.widgetParams.container.innerHTML = `
        <a
          data-testid="RefinementList-link"
          href="${renderOptions.createURL('value')}"
        >
          LINK
        </a>
      `;
    }
  );
  instantsearch(instantSearchOptions)
    .addWidgets([
      refinementListURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
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
});

createMenuTests(({ instantSearchOptions, widgetParams }) => {
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
});

createPaginationTests(({ instantSearchOptions, widgetParams }) => {
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
      paginationURL({
        container: document.body.appendChild(document.createElement('div')),
        ...widgetParams,
      }),
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
});

createInfiniteHitsTests(({ instantSearchOptions, widgetParams }) => {
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
});

createHitsTests(({ instantSearchOptions, widgetParams }) => {
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
});

createRangeInputTests(({ instantSearchOptions, widgetParams }) => {
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
});

createInstantSearchTests(({ instantSearchOptions }) => {
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
});
