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
} from '@instantsearch/tests';

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
